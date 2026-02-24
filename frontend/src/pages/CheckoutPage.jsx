import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShoppingBag, Truck, ShieldCheck, Check, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { storeService } from '../services/storeService';
import marketingService from '../services/marketingService';
import { getImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';
import { useMercadoPago } from '../hooks/useMercadoPago';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { shippingSelected, cep } = location.state || {};

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        email: user.email || '',
        nome: user.name?.split(' ')[0] || '',
        sobrenome: user.name?.split(' ').slice(1).join(' ') || '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: cep || '',
        metodoPagamento: 'pix',
        saveAddress: false,
        saveCard: false
    });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(!cep);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [isAddingNewCard, setIsAddingNewCard] = useState(true);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [currentShipping, setCurrentShipping] = useState(shippingSelected || null);
    const [configMissing, setConfigMissing] = useState({ mp: false, shipping: false });

    const { mp, loading: mpLoading, isConfigured } = useMercadoPago();
    const [cardForm, setCardForm] = useState(null);

    // Cálculos de preço - movidos para o escopo do componente
    const subtotal = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;
    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE'
            ? (subtotal * (appliedCoupon.value / 100))
            : appliedCoupon.value)
        : 0;
    const total = subtotal + (currentShipping?.price || 0) - discount;

    React.useEffect(() => {
        const initCheckout = async () => {
            const currentCart = await storeService.cart.get();
            setCart(currentCart);

            if (user.id) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || prev.email,
                    nome: user.name?.split(' ')[0] || prev.nome,
                    sobrenome: user.name?.split(' ').slice(1).join(' ') || prev.sobrenome
                }));

                try {
                    const addresses = await storeService.address.get(user.id);
                    setSavedAddresses(addresses);
                    if (addresses.length > 0 && !cep) {
                        setIsAddingNewAddress(false);
                    }

                    const cards = await storeService.cards.get();
                    setSavedCards(cards);
                    if (cards.length > 0) {
                        setIsAddingNewCard(false);
                        setSelectedCardId(cards[0].id);
                    }
                } catch (e) {
                    console.error("Erro ao carregar dados do usuário", e);
                }
            }

            // Recalcula frete se já houver um CEP definido e itens no carrinho
            if (formData.cep && formData.cep.length === 8 && currentCart.length > 0) {
                handleCalculateShipping(formData.cep);
            }

            if (cep) {
                handleCalculateShipping(cep);
            }
        };

        const handleCartChange = () => {
            console.log("[DEBUG] Evento 'cart-updated' recebido no Checkout. Re-sincronizando...");
            initCheckout();
        };
        window.addEventListener('cart-updated', handleCartChange);

        initCheckout();

        return () => {
            window.removeEventListener('cart-updated', handleCartChange);
        };
    }, []);

    // Inicializa/Reseta CardForm
    React.useEffect(() => {
        if (mp && isConfigured && isAddingNewCard && formData.metodoPagamento === 'card') {
            if (!cardForm) {
                try {
                    const cf = mp.cardForm({
                        amount: total.toString(),
                        iframe: true,
                        form: {
                            id: 'form-checkout',
                            cardNumber: { id: 'cardNumber', placeholder: '0000 0000 0000 0000' },
                            expirationDate: { id: 'expirationDate', placeholder: 'MM/AA' },
                            securityCode: { id: 'securityCode', placeholder: 'CVV' },
                            cardholderName: { id: 'cardholderName' },
                            identificationType: { id: 'identificationType' },
                            identificationNumber: { id: 'identificationNumber' },
                        },
                        callbacks: {
                            onFormMounted: (error) => {
                                if (error) console.error('Erro ao montar fields:', error);
                            },
                            onSubmit: (event) => {
                                event.preventDefault();
                            },
                            onError: (errors) => {
                                console.error('Erros no cardForm:', errors);
                            }
                        }
                    });
                    setCardForm(cf);
                } catch (e) {
                    console.error("Erro ao inicializar CardForm", e);
                }
            }
        } else if (cardForm) {
            // O SDK v2 não expõe destroy explícito, mas limpamos a referência.
            setCardForm(null);
        }
    }, [mp, isConfigured, isAddingNewCard, formData.metodoPagamento]);

    const handleCalculateShipping = async (targetCep) => {
        if (!targetCep || targetCep.length < 8) return;
        setShippingLoading(true);
        try {
            const items = await storeService.cart.get();
            const options = await storeService.calculateShipping(targetCep, items);
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
            }
        } catch (e) {
            console.error("Erro frete", e);
        } finally {
            setShippingLoading(false);
        }
    };

    const handleSelectAddress = (addr) => {
        const normalizedCep = addr.zipCode.replace(/\D/g, '');
        setSelectedAddressId(addr.id);
        setIsAddingNewAddress(false);
        setFormData(prev => ({
            ...prev,
            endereco: addr.street + (addr.number ? `, ${addr.number}` : '') + (addr.complement ? ` - ${addr.complement}` : ''),
            cidade: addr.city,
            estado: addr.state,
            cep: normalizedCep
        }));
        handleCalculateShipping(normalizedCep);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const result = await marketingService.validateCoupon(couponCode, user.id, subtotal);
            setAppliedCoupon(result);
        } catch (err) {
            setCouponError(err.message || 'Erro ao validar cupom');
            setAppliedCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Salvar endereço se solicitado
            if (formData.saveAddress && isAddingNewAddress && user.id) {
                const addrData = {
                    street: formData.endereco.split(',')[0].trim(),
                    number: formData.endereco.split(',')[1]?.trim() || '',
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    complement: ''
                };
                await storeService.address.create(user.id, addrData);
            }

            // 2. Preparar dados do pedido
            const order = {
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity, variantId: i.variantId })),
                customerEmail: formData.email,
                customerName: `${formData.nome} ${formData.sobrenome}`,
                shipping: {
                    street: formData.endereco.split(',')[0].trim(),
                    number: formData.endereco.split(',')[1]?.trim() || 'S/N',
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    service: currentShipping?.service,
                    price: currentShipping?.price
                },
                totalAmount: total,
                paymentMethod: formData.metodoPagamento,
                couponCode: appliedCoupon?.code,
                saveAddress: formData.saveAddress,
                saveCard: formData.saveCard
            };

            // 3. Lógica de Pagamento
            if (formData.metodoPagamento === 'card') {
                if (!isAddingNewCard && selectedCardId) {
                    order.cardId = selectedCardId;
                } else {
                    if (!cardForm) throw new Error("Sistema de pagamento não inicializado.");

                    const cardData = cardForm.getCardFormData();
                    if (!cardData.token) {
                        throw new Error("Verifique os dados do cartão de crédito.");
                    }
                    order.paymentToken = cardData.token;
                }
            }

            const result = await storeService.createOrder(order);
            setSuccessOrder(result);
            await storeService.cart.clear();
        } catch (error) {
            console.error(error);
            window.dispatchEvent(new CustomEvent('show-alert', { detail: error.message || "Erro ao processar o pedido. Tente novamente." }));
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
                    Seu pedido <strong>#{successOrder.id || successOrder.orderId}</strong> foi recebido com sucesso.
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

            {(configMissing.mp || configMissing.shipping) && (
                <div className="max-w-6xl mx-auto mb-12 p-6 border border-amber-200 bg-amber-50 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <div>
                        <h3 className="font-lato text-xs font-bold uppercase tracking-widest text-amber-900 mb-1">Aviso do Sistema</h3>
                        <p className="font-lato text-xs text-amber-800/80 leading-relaxed">
                            Estamos finalizando os últimos ajustes técnicos em nosso checkout.
                            {configMissing.mp && " Os métodos de pagamento via Cartão e Mercado Pago estão temporariamente indisponíveis."}
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
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Endereço de Entrega</h2>
                            </div>

                            {/* Seleção de Endereços Salvos */}
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
                                                handleInputChange({ target: { name: 'cep', value: val } });
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
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">3</span>
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
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">4</span>
                                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Pagamento</h2>
                            </div>
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'pix' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                    <input type="radio" name="metodoPagamento" value="pix" checked={formData.metodoPagamento === 'pix'} onChange={handleInputChange} className="accent-[var(--azul-profundo)]" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm italic font-bold">PIX</div>
                                        <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Pix com 5% de desconto</span>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'card' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                    <input type="radio" name="metodoPagamento" value="card" checked={formData.metodoPagamento === 'card'} onChange={handleInputChange} className="accent-[var(--azul-profundo)]" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm">
                                            <CreditCard size={20} />
                                        </div>
                                        <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Cartão de Crédito / Débito</span>
                                    </div>
                                </label>

                                {formData.metodoPagamento === 'card' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                        {/* Cartões Salvos */}
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

                                        {/* Formulário de Novo Cartão */}
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
                                                        <>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs text-gray-500 mb-1">Número do Cartão</label>
                                                                <div id="cardNumber" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3"></div>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs text-gray-500 mb-1">Nome Impresso no Cartão</label>
                                                                <input type="text" id="cardholderName" placeholder="JOAO M SILVA" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] uppercase" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Validade</label>
                                                                <div id="expirationDate" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3"></div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                                                <div id="securityCode" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3"></div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Tipo de Doc.</label>
                                                                <select id="identificationType" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"></select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Número do Doc.</label>
                                                                <input type="text" id="identificationNumber" placeholder="CPF/CNPJ" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]" />
                                                            </div>
                                                        </>
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
                        </section>
                    </div>

                    {/* Resumo */}
                    <div className="flex-1">
                        <div className="sticky top-32 space-y-8">
                            <div className="bg-white p-8 border border-[#0f2A44]/5 shadow-sm space-y-8">
                                <h2 className="font-playfair text-2xl text-[#0f2A44]">Resumo do Pedido</h2>

                                <div className="space-y-6">
                                    {cart?.items?.map(item => (
                                        <div key={item.id} className="flex justify-between items-start gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-16 bg-[#F7F7F4] overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        onError={(e) => { e.target.src = '/images/default.png'; }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-lato text-[11px] font-bold text-[#0f2A44] uppercase">{item.name}</p>
                                                    <p className="font-lato text-[10px] text-[#0f2A44]/40">Qtd: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-lato text-xs text-[#0f2A44]">
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
                                            <span>Frete ({shippingSelected?.provider || 'A calcular'})</span>
                                        </div>
                                        <span>{shippingSelected ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingSelected.price) : '—'}</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                                            <span>Desconto ({appliedCoupon.code})</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-[#0f2A44] font-lato text-lg font-bold pt-4">
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
                                    disabled={loading || !currentShipping || !formData.email || !formData.nome || (formData.metodoPagamento === 'card' && isAddingNewCard && !cardToken && false)}
                                    className="w-full bg-[var(--azul-profundo)] text-white py-5 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                                >
                                    {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : 'Finalizar Pedido'}
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-4 opacity-40">
                                <p className="font-lato text-[9px] uppercase tracking-widest text-[#0f2A44]">Ambiente 100% Seguro</p>
                                <div className="flex gap-4">
                                    <div className="w-10 h-6 bg-white border border-[#0f2A44]/10 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                                    <div className="w-10 h-6 bg-white border border-[#0f2A44]/10 rounded flex items-center justify-center text-[8px] font-bold">SSL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
