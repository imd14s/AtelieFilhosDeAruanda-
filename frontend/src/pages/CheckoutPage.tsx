import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, Check, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import marketingService from '../services/marketingService';
import { getImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';
import { useMercadoPago } from '../hooks/useMercadoPago';
import { User, Address, Card, Coupon, ShippingOption, CartItem, Order, CreateOrderData } from '../types';
import { MaskedInput } from '../components/ui/MaskedInput';
import { isValidCPF, isValidCNPJ, sanitizeDocument } from '../utils/fiscal';

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

    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [successOrder, setSuccessOrder] = useState<Order | null>(null);
    const [couponCode, setCouponCode] = useState<string>('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState<string>('');
    const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

    // Simplificado para evitar parse repetitivo
    const user: Partial<User> = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState<CheckoutFormData>({
        email: user.email || '',
        nome: user.name?.split(' ')[0] || '',
        sobrenome: user.name?.split(' ').slice(1).join(' ') || '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: cep || '',
        metodoPagamento: 'pix',
        saveAddress: false,
        saveCard: false,
        document: user.document || ''
    });

    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(!cep);
    const [savedCards, setSavedCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(true);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [shippingLoading, setShippingLoading] = useState<boolean>(false);
    const [currentShipping, setCurrentShipping] = useState<ShippingOption | null>(shippingSelected || null);
    const [configMissing, setConfigMissing] = useState<{ mp: boolean; shipping: boolean }>({ mp: false, shipping: false });

    const { mp, loading: mpLoading, isConfigured, error: mpError } = useMercadoPago();
    const [_cardForm, setCardForm] = useState<unknown>(null);
    const cardFormRef = useRef<any>(null); // External SDK Ref usually needs any or complex interface
    const pendingOrderRef = useRef<CreateOrderData | null>(null);

    // Cálculos de preço
    const subtotal = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;
    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE' || appliedCoupon.discountType === 'PERCENTAGE'
            ? (subtotal * (appliedCoupon.value / 100))
            : appliedCoupon.value)
        : 0;

    // Aplicar desconto de 5% no PIX se não houver cupom (ou conforme regra de negócio)
    const pixDiscount = formData.metodoPagamento === 'pix' ? (subtotal * 0.05) : 0;

    const total = subtotal + (currentShipping?.price || 0) - discount - pixDiscount;

    useEffect(() => {
        const initCheckout = async () => {
            const currentCart = await cartService.get();
            setCart(currentCart);

            if (user.id) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || prev.email,
                    nome: user.name?.split(' ')[0] || prev.nome,
                    sobrenome: user.name?.split(' ').slice(1).join(' ') || prev.sobrenome,
                    document: user.document || prev.document
                }));

                try {
                    const addresses = await authService.address.get(user.id);
                    setSavedAddresses(addresses);
                    if (addresses.length > 0 && !cep) {
                        setIsAddingNewAddress(false);
                        // Seleciona o padrão se existir
                        const def = addresses.find(a => a.isDefault);
                        if (def) handleSelectAddress(def);
                    }

                    const cards = await authService.cards.get();
                    setSavedCards(cards);
                    if (cards.length > 0) {
                        setIsAddingNewCard(false);
                        setSelectedCardId(cards[0].id);
                    }
                } catch (e) {
                    console.error("Erro ao carregar dados do usuário", e);
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
                                    onFormMounted: (error: any) => {
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
                                        } catch (error: any) {
                                            window.dispatchEvent(new CustomEvent('show-alert', {
                                                detail: error.message || "Erro ao processar pagamento."
                                            }));
                                        } finally {
                                            setLoading(false);
                                            pendingOrderRef.current = null;
                                        }
                                    },
                                    onError: (errors: any[]) => console.error('Erros no cardForm:', errors)
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
        if (!couponCode || !user.id) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const result = await marketingService.validateCoupon(couponCode, user.id, subtotal);
            setAppliedCoupon(result);
        } catch (err: any) {
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
            const userId = user.id || user.googleId;
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
        } catch (error: any) {
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
                    {/* Formulário */}
                    <div className="flex-[1.5] space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">1</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Informações de Contato</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <input
                                    type="email" name="email" required placeholder="E-mail para acompanhamento"
                                    value={formData.email} onChange={handleInputChange}
                                    className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                />
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">2</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Identificação Fiscal</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <MaskedInput
                                    mask="cpf-cnpj"
                                    required
                                    label="CPF ou CNPJ (para Nota Fiscal)"
                                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    value={formData.document}
                                    onChange={(val) => setFormData(prev => ({ ...prev, document: val }))}
                                    className="border-[var(--azul-profundo)]/10"
                                />
                                <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40 uppercase tracking-widest leading-relaxed">
                                    Necessário para a emissão da Nota Fiscal Eletrônica (NF-e).
                                </p>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">3</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Endereço de Entrega</h2>
                            </div>

                            {savedAddresses.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {savedAddresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`p-4 border cursor-pointer transition-all ${selectedAddressId === addr.id && !isAddingNewAddress ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/30'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-lato text-[10px] font-bold uppercase tracking-widest text-[var(--azul-profundo)]">{addr.street}, {addr.number}</span>
                                                {selectedAddressId === addr.id && !isAddingNewAddress && <Check size={14} className="text-[var(--dourado-suave)]" />}
                                            </div>
                                            <p className="font-lato text-xs text-[var(--azul-profundo)]/60 line-clamp-1">{addr.city} - {addr.state}</p>
                                            <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40 mt-1">{addr.zipCode}</p>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setIsAddingNewAddress(true);
                                            setSelectedAddressId(null);
                                            setFormData(prev => ({ ...prev, endereco: '', cidade: '', estado: '', cep: '' }));
                                        }}
                                        className={`p-4 border border-dashed flex items-center justify-center gap-2 font-lato text-[10px] uppercase tracking-widest transition-all ${isAddingNewAddress ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/40 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/60'}`}
                                    >
                                        + Novo Endereço
                                    </button>
                                </div>
                            )}

                            {isAddingNewAddress && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                                    <input
                                        type="text" name="nome" required placeholder="Nome"
                                        value={formData.nome} onChange={handleInputChange}
                                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                    <input
                                        type="text" name="sobrenome" required placeholder="Sobrenome"
                                        value={formData.sobrenome} onChange={handleInputChange}
                                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                    <input
                                        type="text" name="endereco" required placeholder="Endereço e Número"
                                        value={formData.endereco} onChange={handleInputChange}
                                        className="md:col-span-2 w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                    <input
                                        type="text" name="cidade" required placeholder="Cidade"
                                        value={formData.cidade} onChange={handleInputChange}
                                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <input
                                            type="text" name="estado" required placeholder="UF"
                                            value={formData.estado} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                        />
                                        <input
                                            type="text" name="cep" required placeholder="CEP"
                                            value={formData.cep} onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').substring(0, 8);
                                                handleInputChange({ target: { name: 'cep', value: val } } as any);
                                                if (val.length === 8) handleCalculateShipping(val);
                                            }}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                        />
                                    </div>
                                    {user.id && (
                                        <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.saveAddress}
                                                onChange={(e) => setFormData(prev => ({ ...prev, saveAddress: e.target.checked }))}
                                                className="accent-[var(--azul-profundo)]"
                                            />
                                            <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60">Salvar este endereço para futuras compras</span>
                                        </label>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">4</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Escolha o Frete</h2>
                            </div>

                            {shippingLoading ? (
                                <div className="flex items-center gap-3 text-[var(--azul-profundo)]/40 p-8 border border-dashed border-[var(--azul-profundo)]/10">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="font-lato text-xs uppercase tracking-widest">Calculando opções de frete...</span>
                                </div>
                            ) : shippingOptions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shippingOptions.map((opt, i) => (
                                        <label
                                            key={i}
                                            className={`flex items-center justify-between p-6 border cursor-pointer transition-colors ${currentShipping?.provider === opt.provider ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/30'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    checked={currentShipping?.provider === opt.provider}
                                                    onChange={() => setCurrentShipping(opt)}
                                                    className="accent-[var(--azul-profundo)]"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">{opt.provider}</span>
                                                    <span className="font-lato text-[10px] text-[var(--azul-profundo)]/40">{opt.days} dias úteis</span>
                                                </div>
                                            </div>
                                            <span className="font-lato text-sm font-bold text-[var(--azul-profundo)]">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.price)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-8 border border-[var(--azul-profundo)]/5 flex flex-col items-center gap-4 text-center">
                                    <Truck size={32} className="text-[var(--azul-profundo)]/10" />
                                    <p className="font-lato text-xs text-[var(--azul-profundo)]/40 uppercase tracking-widest max-w-[200px]">
                                        {configMissing.shipping
                                            ? "Cálculo de frete em manutenção. Por favor, tente novamente mais tarde."
                                            : (formData.cep.length === 8 ? "Nenhuma opção de frete disponível para este CEP." : "Insira um CEP válido para ver as opções de frete.")
                                        }
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">5</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Pagamento</h2>
                            </div>
                            {mpLoading ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 size={32} className="animate-spin text-[var(--dourado-suave)]" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'pix' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                        <input type="radio" name="metodoPagamento" value="pix" checked={formData.metodoPagamento === 'pix'} onChange={handleInputChange as any} className="accent-[var(--azul-profundo)]" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm italic font-bold">PIX</div>
                                            <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Pix com 5% de desconto</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'card' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                        <input type="radio" name="metodoPagamento" value="card" checked={formData.metodoPagamento === 'card'} onChange={handleInputChange as any} className="accent-[var(--azul-profundo)]" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm">
                                                <CreditCard size={20} />
                                            </div>
                                            <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Cartão de Crédito / Débito</span>
                                        </div>
                                    </label>

                                    {formData.metodoPagamento === 'card' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                            {savedCards.length > 0 && (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {savedCards.map(card => (
                                                        <div
                                                            key={card.id}
                                                            onClick={() => { setSelectedCardId(card.id); setIsAddingNewCard(false); }}
                                                            className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${selectedCardId === card.id && !isAddingNewCard ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center font-bold text-[8px] uppercase">{card.payment_method?.id || 'CARD'}</div>
                                                                <div>
                                                                    <p className="font-lato text-xs font-bold text-[var(--azul-profundo)]">**** **** **** {card.last_four_digits}</p>
                                                                    <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40">Expira em {card.expiration_month}/{card.expiration_year}</p>
                                                                </div>
                                                            </div>
                                                            {selectedCardId === card.id && !isAddingNewCard && <Check size={14} className="text-[var(--dourado-suave)]" />}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => { setIsAddingNewCard(true); setSelectedCardId(null); }}
                                                        className={`p-4 border border-dashed flex items-center justify-center gap-2 font-lato text-[10px] uppercase tracking-widest transition-all ${isAddingNewCard ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/40 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/60'}`}
                                                    >
                                                        + Novo Cartão
                                                    </button>
                                                </div>
                                            )}

                                            {isAddingNewCard && (
                                                <div className="p-6 border border-[var(--azul-profundo)]/10 bg-white">
                                                    <h3 className="font-lato text-xs font-bold uppercase tracking-widest text-[var(--azul-profundo)] mb-6 flex items-center gap-2">
                                                        <ShieldCheck size={16} className="text-green-600" /> Novo Cartão via Mercado Pago
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {!isConfigured && !mpLoading ? (
                                                            <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-xs flex items-start gap-3">
                                                                <AlertTriangle size={18} className="shrink-0" />
                                                                <div>
                                                                    <p className="font-bold uppercase tracking-widest mb-1">Pagamento com Cartão Indisponível</p>
                                                                    <p className="opacity-80">A configuração do Mercado Pago está pendente. Por favor, utilize PIX ou aguarde a ativação pelo administrador.</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <form id="form-checkout" className="contents">
                                                                <input type="hidden" id="cardholderEmail" value={formData.email} />
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs text-gray-500 mb-1">Número do Cartão</label>
                                                                    <div id="cardNumber" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs text-gray-500 mb-1">Nome Impresso no Cartão</label>
                                                                    <input type="text" id="cardholderName" placeholder="JOAO M SILVA" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] uppercase shadow-inner" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">Validade</label>
                                                                    <div id="expirationDate" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                                                    <div id="securityCode" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">Tipo de Doc.</label>
                                                                    <select id="identificationType" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">Número do Doc.</label>
                                                                    <input type="text" id="identificationNumber" placeholder="CPF/CNPJ" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">Banco Emissor</label>
                                                                    <select id="issuer" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500 mb-1">Parcelamento</label>
                                                                    <select id="installments" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                                </div>
                                                            </form>
                                                        )}

                                                        {user.id && (
                                                            <label className="md:col-span-2 flex items-center gap-2 cursor-pointer mt-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.saveCard}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
                                                                    className="accent-[var(--azul-profundo)]"
                                                                />
                                                                <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60">Salvar este cartão para futuras compras</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Resumo */}
                    <div className="flex-1">
                        <div className="sticky top-32 space-y-8">
                            <div className="bg-white p-8 border border-[#0f2A44]/5 shadow-sm space-y-8">
                                <h2 className="font-playfair text-2xl text-[#0f2A44]">Resumo do Pedido</h2>

                                <div className="space-y-6">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-16 bg-[#F7F7F4] overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(item.image || '')}
                                                        alt={item.name}
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = '/images/default.png'; }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-lato text-[11px] font-bold text-[#0f2A44] uppercase line-clamp-2">{item.name}</p>
                                                    <p className="font-lato text-[10px] text-[#0f2A44]/40">Qtd: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-lato text-xs text-[#0f2A44] whitespace-nowrap">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[#0f2A44]/5 pt-6 space-y-3">
                                    <div className="flex justify-between text-[#0f2A44]/60 font-lato text-xs">
                                        <span>Subtotal</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#0f2A44]/60 font-lato text-xs">
                                        <div className="flex items-center gap-2">
                                            <Truck size={14} className="text-[#C9A24D]" />
                                            <span>Frete ({currentShipping?.provider || 'A calcular'})</span>
                                        </div>
                                        <span>{currentShipping ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentShipping.price) : '—'}</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                                            <span>Desconto ({appliedCoupon.code})</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span>
                                        </div>
                                    )}

                                    {pixDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                                            <span>Desconto Pix (5%)</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-[#0f2A44] font-lato text-lg font-bold pt-4 border-t border-[#0f2A44]/5">
                                        <span>Total</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                    </div>
                                </div>

                                {/* Cupom */}
                                <div className="pt-4 border-t border-[#0f2A44]/5">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="CUPOM DE DESCONTO"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-[10px] outline-none focus:border-[var(--dourado-suave)]"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon || !couponCode}
                                            className="bg-[var(--azul-profundo)] text-white px-4 py-3 font-lato text-[10px] uppercase tracking-widest hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30"
                                        >
                                            {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                                        </button>
                                    </div>
                                    {couponError && <p className="text-[10px] text-red-500 mt-2 font-bold">{couponError}</p>}
                                    {appliedCoupon && <p className="text-[10px] text-green-600 mt-2 font-bold">✓ Cupom aplicado!</p>}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !currentShipping || !formData.email || !formData.nome || !formData.document || (formData.metodoPagamento === 'card' && isAddingNewCard && !isConfigured)}
                                    className="w-full bg-[var(--azul-profundo)] text-white py-5 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Finalizar Pedido'}
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded bg-gray-200" />
                                    <div className="w-8 h-8 rounded bg-gray-200" />
                                    <div className="w-8 h-8 rounded bg-gray-200" />
                                </div>
                                <p className="font-lato text-[10px] uppercase tracking-widest">Pagamento 100% Seguro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
