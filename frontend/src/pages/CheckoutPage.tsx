/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Loader2, AlertCircle, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import marketingService from '../services/marketingService';
import SEO from '../components/SEO';
import { useMercadoPago } from '../hooks/useMercadoPago';
import { useAuth } from '../context/AuthContext';
import { Coupon, ShippingOption, CartItem, Order, CreateOrderData, Address } from '../types';
import { isValidCPF, isValidCNPJ, sanitizeDocument } from '../utils/fiscal';
import { SafeAny } from "../types/safeAny";

// Novos componentes modulares
import CheckoutContact from '../components/checkout/CheckoutContact';
import CheckoutAddress from '../components/checkout/CheckoutAddress';
import CheckoutShipping from '../components/checkout/CheckoutShipping';
import CheckoutPayment from '../components/checkout/CheckoutPayment';
import CheckoutSummary from '../components/checkout/CheckoutSummary';

interface CheckoutFormData {
    email: string;
    nome: string;
    sobrenome: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    metodoPagamento: 'pix' | 'card';
    saveAddress: boolean;
    saveCard: boolean;
    document: string;
}

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const { shippingSelected, cep } = (location.state as { shippingSelected?: ShippingOption; cep?: string }) || {};
    const { user, addresses, cards } = useAuth();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [successOrder, setSuccessOrder] = useState<Order | null>(null);
    const [couponCode, setCouponCode] = useState<string>('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string>('');
    const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

    const [formData, setFormData] = useState<CheckoutFormData>({
        email: user?.email || '',
        nome: user?.name?.split(' ')[0] || '',
        sobrenome: user?.name?.split(' ').slice(1).join(' ') || '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: cep || '',
        metodoPagamento: 'pix',
        saveAddress: false,
        saveCard: false,
        document: user?.document || ''
    });

    const { mp, loading: mpLoading, isConfigured, pixActive, cardActive, pixDiscountPercent, error: mpError } = useMercadoPago();

    // Ajuste inicial do método de pagamento baseado na disponibilidade
    useEffect(() => {
        if (!mpLoading && !pixActive && cardActive) {
            setFormData(prev => ({ ...prev, metodoPagamento: 'card' }));
        } else if (!mpLoading && pixActive) {
            setFormData(prev => ({ ...prev, metodoPagamento: 'pix' }));
        }
    }, [mpLoading, pixActive, cardActive]);

    const [_cardForm, setCardForm] = useState<unknown>(null);
    const cardFormRef = useRef<SafeAny>(null); // External SDK Ref usually needs any or complex interface
    const pendingOrderRef = useRef<CreateOrderData | null>(null);

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(!cep);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(true);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [shippingLoading, setShippingLoading] = useState<boolean>(false);
    const [currentShipping, setCurrentShipping] = useState<ShippingOption | null>(shippingSelected || null);
    const [configMissing, setConfigMissing] = useState<{ mp: boolean; shipping: boolean }>({ mp: false, shipping: false });

    // Cálculos de preço
    const subtotal = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;
    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE' || appliedCoupon.discountType === 'PERCENTAGE'
            ? (subtotal * (appliedCoupon.value / 100))
            : appliedCoupon.value)
        : 0;

    // Aplicar desconto PIX dinâmico vindo da configuração do backend
    const currentPixDiscountPercent = (pixDiscountPercent || 0) / 100;
    const pixDiscount = formData.metodoPagamento === 'pix' ? (subtotal * currentPixDiscountPercent) : 0;

    const total = subtotal + (currentShipping?.price || 0) - discount - pixDiscount;

    useEffect(() => {
        const initCheckout = async () => {
            const currentCart = await cartService.get();
            setCart(currentCart);

            if (user && user.id) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || prev.email,
                    nome: user.name?.split(' ')[0] || prev.nome,
                    sobrenome: user.name?.split(' ').slice(1).join(' ') || prev.sobrenome,
                    document: user.document || prev.document
                }));

                // Inicializa seleção de endereço se houver endereços e nenhum selecionado
                if (addresses.length > 0) {
                    if (!selectedAddressId && !cep) {
                        setIsAddingNewAddress(false);
                        const def = addresses.find(a => a.isDefault) || addresses[0];
                        if (def) handleSelectAddress(def);
                    }
                } else {
                    setIsAddingNewAddress(true);
                }

                // Inicializa seleção de cartão se houver cartões
                if (cards.length > 0 && !selectedCardId) {
                    setIsAddingNewCard(false);
                    const firstCard = cards[0];
                    if (firstCard) {
                        setSelectedCardId(firstCard.id || null);
                    }
                }
            }

            if (formData.cep && formData.cep.length === 8 && currentCart.length > 0) {
                handleCalculateShipping(formData.cep);
            } else if (cep) {
                handleCalculateShipping(cep);
            }
        };

        const handleCartChange = () => initCheckout();
        window.addEventListener('cart-updated', handleCartChange);
        initCheckout();

        return () => window.removeEventListener('cart-updated', handleCartChange);
    }, []);

    // Inicializa/Reseta CardForm
    useEffect(() => {
        let mounted = true;

        const initCardForm = () => {
            if (mp && isConfigured && isAddingNewCard && formData.metodoPagamento === 'card') {
                if (!cardFormRef.current) {
                    setTimeout(() => {
                        if (!mounted) return;
                        const container = document.getElementById('cardNumber');
                        if (!container) return;

                        try {
                            const cf = mp.cardForm({
                                amount: total.toFixed(2),
                                iframe: true,
                                form: {
                                    id: 'form-checkout',
                                    cardNumber: { id: 'cardNumber', placeholder: '0000 0000 0000 0000' },
                                    expirationDate: { id: 'expirationDate', placeholder: 'MM/AA' },
                                    securityCode: { id: 'securityCode', placeholder: 'CVV' },
                                    cardholderName: { id: 'cardholderName' },
                                    identificationType: { id: 'identificationType' },
                                    identificationNumber: { id: 'identificationNumber' },
                                    issuer: { id: 'issuer' },
                                    installments: { id: 'installments' },
                                    cardholderEmail: { id: 'cardholderEmail' }
                                },
                                callbacks: {
                                    onFormMounted: (error: SafeAny) => {
                                        if (error) console.error('Erro ao montar fields:', error);
                                    },
                                    onSubmit: async (event: React.FormEvent) => {
                                        event.preventDefault();
                                        setLoading(true);
                                        try {
                                            const cf = cardFormRef.current;
                                            if (!cf) throw new Error("CardForm não finalizou.");
                                            const cardData = cf.getCardFormData();
                                            if (!cardData || !cardData.token) throw new Error("Erro na tokenização do cartão.");

                                            const order = pendingOrderRef.current;
                                            if (order) {
                                                order.paymentToken = cardData.token;
                                                // @ts-ignore - Complementando CreateOrderData se necessário
                                                order.installments = cardData.installments ? parseInt(cardData.installments) : 1;
                                                // @ts-ignore
                                                order.issuerId = cardData.issuer || null;

                                                const result = await orderService.createOrder(order);
                                                setSuccessOrder(result);
                                                await cartService.clear();
                                            }
                                        } catch (error: SafeAny) {
                                            window.dispatchEvent(new CustomEvent('show-alert', {
                                                detail: error.message || "Erro ao processar pagamento."
                                            }));
                                        } finally {
                                            setLoading(false);
                                            pendingOrderRef.current = null;
                                        }
                                    },
                                    onError: (errors: SafeAny[]) => console.error('Erros no cardForm:', errors)
                                }
                            });
                            setCardForm(cf);
                            cardFormRef.current = cf;
                        } catch (e) {
                            console.error("Erro ao inicializar CardForm", e);
                        }
                    }, 200);
                }
            }
        };

        if (formData.metodoPagamento === 'card') initCardForm();
        return () => { mounted = false; };
    }, [mp, isConfigured, isAddingNewCard, formData.metodoPagamento]);

    const handleCalculateShipping = async (targetCep: string) => {
        if (!targetCep || targetCep.length < 8) return;
        setShippingLoading(true);
        try {
            const items = await cartService.get();
            const options = await orderService.calculateShipping(targetCep, items);
            const isMissing = options.some(o => o.provider === 'CONFIG_MISSING');
            if (isMissing) {
                setConfigMissing(prev => ({ ...prev, shipping: true }));
                setShippingOptions([]);
            } else {
                setConfigMissing(prev => ({ ...prev, shipping: false }));
                setShippingOptions(options);
            }

            if (currentShipping) {
                const stillAvailable = options.find(o => o.provider === currentShipping.provider);
                if (stillAvailable) setCurrentShipping(stillAvailable);
                else setCurrentShipping(null);
            } else if (options.length > 0) {
                // Seleciona o primeiro por padrão
                setCurrentShipping(options[0] || null);
            }
        } catch (e) {
            console.error("Erro frete", e);
        } finally {
            setShippingLoading(false);
        }
    };

    const handleSelectAddress = (addr: Address) => {
        const normalizedCep = addr.zipCode.replace(/\D/g, '');
        setSelectedAddressId(addr.id || null);
        setIsAddingNewAddress(false);
        setFormData(prev => ({
            ...prev,
            endereco: addr.street + (addr.number ? `, ${addr.number}` : '') + (addr.complement ? ` - ${addr.complement}` : ''),
            cidade: addr.city,
            estado: addr.state,
            cep: normalizedCep,
            document: addr.document || prev.document
        }));
        handleCalculateShipping(normalizedCep);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode || !user?.id) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const result = await marketingService.validateCoupon(couponCode, user.id, subtotal);
            setAppliedCoupon(result);
        } catch (err: SafeAny) {
            setCouponError(err.message || 'Erro ao validar cupom');
            setAppliedCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação rigorosa de documento
        const cleanDoc = sanitizeDocument(formData.document);
        const isDocValid = cleanDoc.length === 11 ? isValidCPF(cleanDoc) : (cleanDoc.length === 14 ? isValidCNPJ(cleanDoc) : false);

        if (!isDocValid) {
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: "Por favor, insira um CPF ou CNPJ válido para a emissão da Nota Fiscal."
            }));
            return;
        }

        setLoading(true);
        try {
            const userId = user?.id || user?.googleId;
            // 1. Salvar endereço se solicitado
            if (formData.saveAddress && isAddingNewAddress && userId) {
                const parts = formData.endereco.split(',');
                const addrData: Address = {
                    label: 'Principal',
                    street: parts[0]?.trim() || '',
                    number: parts[1]?.trim() || 'S/N',
                    neighborhood: 'Centro',
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    complement: ''
                };
                await authService.address.create(userId, addrData);
            }

            // 2. Preparar dados do pedido
            const parts = formData.endereco.split(',');
            const order: CreateOrderData = {
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity, variantId: i.variantId })),
                email: formData.email,
                customerName: `${formData.nome} ${formData.sobrenome}`,
                shippingAddress: {
                    street: parts[0]?.trim() || '',
                    number: parts[1]?.trim() || 'S/N',
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    neighborhood: 'Centro' // Default or extracted
                },
                // @ts-ignore - Estendendo se o backend usar 'shipping' opcionalmente
                shipping: {
                    service: currentShipping?.provider,
                    price: currentShipping?.price
                },
                paymentMethod: formData.metodoPagamento,
                couponCode: appliedCoupon?.code,
                customerDocument: sanitizeDocument(formData.document),
                saveAddress: formData.saveAddress,
                saveCard: formData.saveCard
            };

            // 3. Lógica de Pagamento
            if (formData.metodoPagamento === 'card') {
                if (!isAddingNewCard && selectedCardId) {
                    order.cardId = selectedCardId;
                    const result = await orderService.createOrder(order);
                    setSuccessOrder(result);
                    await cartService.clear();
                } else {
                    const cf = cardFormRef.current;
                    if (!cf) throw new Error("Sistema de pagamento não inicializado. Aguarde.");
                    pendingOrderRef.current = order;
                    const form = document.getElementById('form-checkout') as HTMLFormElement;
                    if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    } else {
                        throw new Error("Formulário de cartão não encontrado.");
                    }
                    return;
                }
            } else {
                const result = await orderService.createOrder(order);
                setSuccessOrder(result);
                await cartService.clear();
            }
        } catch (error: SafeAny) {
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: error.message || "Erro ao processar o pedido. Tente novamente."
            }));
        } finally {
            setLoading(false);
        }
    };

    if (successOrder) {
        return (
            <div className="min-h-screen bg-[var(--branco-off-white)] flex flex-col items-center justify-center p-4 text-center">
                <SEO title="Pedido Confirmado" />
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h1 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-4">Que o Axé te acompanhe!</h1>
                <p className="font-lato text-base text-[var(--azul-profundo)]/60 mb-8 max-w-md">
                    Seu pedido <strong>#{successOrder.id}</strong> foi recebido com sucesso.
                    Você receberá um e-mail com os detalhes e o código de rastreio em breve.
                </p>
                <Link to="/" className="bg-[var(--azul-profundo)] text-white px-10 py-4 font-lato text-xs uppercase tracking-widest hover:bg-[var(--dourado-suave)] transition-all">
                    Voltar para o Início
                </Link>
            </div>
        );
    }

    if (cart.length === 0 && !successOrder) {
        return (
            <div className="min-h-screen bg-[var(--branco-off-white)] flex flex-col items-center justify-center p-4">
                <SEO title="Checkout" />
                <p className="font-playfair text-xl text-[var(--azul-profundo)] mb-8">Sua sacola está vazia.</p>
                <Link to="/store" className="text-[var(--dourado-suave)] font-lato text-xs uppercase tracking-widest border-b border-[var(--dourado-suave)]">Ir para a Loja</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--branco-off-white)] pt-12 pb-24 px-4">
            <SEO title="Checkout" description="Finalize sua compra com segurança no Ateliê Filhos de Aruanda." />

            {(configMissing.mp || configMissing.shipping || mpError) && (
                <div className="max-w-6xl mx-auto mb-12 p-6 border border-amber-200 bg-amber-50 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <div>
                        <h3 className="font-lato text-xs font-bold uppercase tracking-widest text-amber-900 mb-1">Aviso do Sistema</h3>
                        <p className="font-lato text-xs text-amber-800/80 leading-relaxed">
                            Estamos finalizando os últimos ajustes técnicos em nosso checkout.
                            {(configMissing.mp || mpError) && " Os métodos de pagamento via Cartão e Mercado Pago estão temporariamente indisponíveis."}
                            {configMissing.shipping && " O cálculo de frete automático está em manutenção."}
                            <br />Pedimos desculpas pelo transtorno. Por favor, tente novamente em alguns instantes ou entre em contato com nosso suporte.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)] transition-colors mb-12">
                    <ChevronLeft size={16} />
                    <span className="font-lato text-[10px] uppercase tracking-widest">Voltar</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Formulário Modularizado */}
                    <div className="flex-[1.5] space-y-12">
                        <CheckoutContact
                            email={formData.email}
                            document={formData.document}
                            onChange={handleInputChange}
                            onDocumentChange={(val) => setFormData(prev => ({ ...prev, document: val }))}
                        />

                        <CheckoutAddress
                            formData={formData}
                            onChange={handleInputChange}
                            onSelectAddress={handleSelectAddress}
                            onSetSaveAddress={(val) => setFormData(prev => ({ ...prev, saveAddress: val }))}
                            isAddingNewAddress={isAddingNewAddress}
                            setIsAddingNewAddress={setIsAddingNewAddress}
                            selectedAddressId={selectedAddressId}
                            onCalculateShipping={handleCalculateShipping}
                        />

                        <CheckoutShipping
                            shippingLoading={shippingLoading}
                            shippingOptions={shippingOptions}
                            currentShipping={currentShipping}
                            onSelectShipping={setCurrentShipping}
                            configMissing={configMissing.shipping}
                            cepLength={formData.cep.length}
                        />

                        <CheckoutPayment
                            mpLoading={mpLoading}
                            pixActive={pixActive}
                            cardActive={cardActive}
                            pixDiscountPercent={pixDiscountPercent}
                            metodoPagamento={formData.metodoPagamento}
                            onMetodoChange={(m) => setFormData(prev => ({ ...prev, metodoPagamento: m }))}
                            savedCards={cards}
                            selectedCardId={selectedCardId}
                            onSelectCard={setSelectedCardId}
                            isAddingNewCard={isAddingNewCard}
                            setIsAddingNewCard={setIsAddingNewCard}
                            isConfigured={isConfigured}
                            email={formData.email}
                            saveCard={formData.saveCard}
                            onSetSaveCard={(val) => setFormData(prev => ({ ...prev, saveCard: val }))}
                        />
                    </div>

                    {/* Resumo Modularizado */}
                    <div className="flex-1 sticky top-32 space-y-8">
                        <CheckoutSummary
                            cart={cart}
                            subtotal={subtotal}
                            currentShipping={currentShipping}
                            appliedCoupon={appliedCoupon}
                            discount={discount}
                            pixDiscount={pixDiscount}
                            total={total}
                            metodoPagamento={formData.metodoPagamento}
                        />

                        {/* Bloco de Cupom e Ação Final (Mantido aqui por interagir com múltiplos estados) */}
                        <div className="mt-8 space-y-6">
                            <div className="bg-white p-6 border border-[#0f2A44]/5">
                                <h3 className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/60 mb-4">Cupom de Desconto</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="CUPOM"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-[10px] outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={validatingCoupon || !couponCode}
                                        className="bg-[var(--azul-profundo)] text-white px-6 py-3 font-lato text-[10px] uppercase tracking-widest hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30"
                                    >
                                        {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[10px] text-red-500 mt-2 font-bold">{couponError}</p>}
                                {appliedCoupon && <p className="text-[10px] text-green-600 mt-2 font-bold">✓ Cupom {appliedCoupon.code} aplicado!</p>}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !currentShipping || !formData.email || !formData.nome || !formData.document || (formData.metodoPagamento === 'card' && isAddingNewCard && !isConfigured)}
                                className="w-full bg-[var(--azul-profundo)] text-white py-6 font-lato text-[11px] uppercase tracking-[0.3em] hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Finalizar Pedido'}
                            </button>

                            <div className="flex flex-col items-center gap-4 opacity-40 py-4">
                                <div className="flex items-center gap-6">
                                    <ShieldCheck size={24} />
                                    <CreditCard size={24} />
                                    <Truck size={24} />
                                </div>
                                <p className="font-lato text-[9px] uppercase tracking-widest text-center">Checkout 100% Seguro & Envio Garantido</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
