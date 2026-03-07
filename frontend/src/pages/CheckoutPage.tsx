import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShoppingBag, Truck, ShieldCheck, Check, CheckCircle, AlertCircle, Loader2, AlertTriangle, Mail, User as UserIcon, MapPin, Hash, FileText } from 'lucide-react';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import marketingService from '../services/marketingService';
import { getImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';
import { useMercadoPago } from '../hooks/useMercadoPago';
import { User, Address, Card, Coupon, ShippingOption, CartItem, Order, CreateOrderData } from '../types';

interface CheckoutFormData {
    email: string;
    nome: string;
    sobrenome: string;
    tipoDocumento: 'CPF' | 'CNPJ';
    documento: string;
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    metodoPagamento: 'pix' | 'card';
    saveAddress: boolean;
    saveCard: boolean;
}

// Helpers de validação
const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
};

const validateCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
};

// Máscaras visuais
const maskCEP = (val: string) => val.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
const maskCPF = (val: string) => val.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
const maskCNPJ = (val: string) => val.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
        tipoDocumento: 'CPF',
        documento: '',
        cep: cep || '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        metodoPagamento: 'pix',
        saveAddress: false,
        saveCard: false
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(true); // Sempre true por padrão para visitantes
    const [savedCards, setSavedCards] = useState<Card[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(true);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [shippingLoading, setShippingLoading] = useState<boolean>(false);
    const [currentShipping, setCurrentShipping] = useState<ShippingOption | null>(shippingSelected || null);
    const [configMissing, setConfigMissing] = useState<{ mp: boolean; shipping: boolean }>({ mp: false, shipping: false });

    const { mp, loading: mpLoading, isConfigured, error: mpError, config } = useMercadoPago();
    const [cardForm, setCardForm] = useState<any>(null);
    const cardFormRef = useRef<any>(null);
    const pendingOrderRef = useRef<CreateOrderData | null>(null);

    // Cálculos de preço
    const subtotal = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;
    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE' || appliedCoupon.discountType === 'PERCENTAGE'
            ? (subtotal * (appliedCoupon.value / 100))
            : appliedCoupon.value)
        : 0;

    // Aplicar desconto de PIX conforme configuração do backend
    const effectivePixDiscountPercent = config?.pixDiscountPercent ?? 0; // Usar 0 se não houver configuração ou carregar do Mercado Pago
    const pixDiscount = (user.id && formData.metodoPagamento === 'pix') ? (subtotal * (effectivePixDiscountPercent / 100)) : 0;

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
                    sobrenome: user.name?.split(' ').slice(1).join(' ') || prev.sobrenome
                }));

                try {
                    const addresses = await authService.address.get(user.id);
                    setSavedAddresses(addresses);
                    if (addresses.length > 0) {
                        setIsAddingNewAddress(false);
                        // Seleciona o padrão se existir, senão o primeiro
                        const def = addresses.find(a => a.isDefault);
                        if (def) {
                            handleSelectAddress(def);
                        } else {
                            handleSelectAddress(addresses[0]);
                        }
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
                                installments: {
                                    minInstallments: 1,
                                    maxInstallments: config?.maxInstallments || 12
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
                setCurrentShipping(options[0]);
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
            rua: addr.street,
            numero: addr.number,
            complemento: addr.complement || '',
            bairro: addr.neighborhood,
            cidade: addr.city,
            estado: addr.state,
            cep: normalizedCep
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

        if (name === 'cep') {
            const val = value.replace(/\D/g, '').substring(0, 8);
            setFormData(prev => ({ ...prev, [name]: val }));

            if (val.length === 8) {
                // Validação e busca ViaCEP
                fetch(`https://viacep.com.br/ws/${val}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro) {
                            setFormData(prev => ({
                                ...prev,
                                rua: data.logradouro,
                                bairro: data.bairro,
                                cidade: data.localidade,
                                estado: data.uf
                            }));
                            setFormErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.cep;
                                return newErrors;
                            });
                            handleCalculateShipping(val);
                        } else {
                            setFormErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
                        }
                    })
                    .catch(() => setFormErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' })));
            } else {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.cep;
                    return newErrors;
                });
            }
            return;
        }

        if (name === 'documento') {
            const val = value.replace(/\D/g, '');
            const maxLength = formData.tipoDocumento === 'CPF' ? 11 : 14;
            const finalVal = val.substring(0, maxLength);
            setFormData(prev => ({ ...prev, [name]: finalVal }));

            if (finalVal.length === maxLength) {
                const isValid = formData.tipoDocumento === 'CPF' ? validateCPF(finalVal) : validateCNPJ(finalVal);
                if (!isValid) {
                    setFormErrors(prev => ({ ...prev, documento: `${formData.tipoDocumento} inválido` }));
                } else {
                    setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.documento;
                        return newErrors;
                    });
                }
            } else {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.documento;
                    return newErrors;
                });
            }
            return;
        }

        if (name === 'tipoDocumento') {
            setFormData(prev => ({ ...prev, [name]: value as any, documento: '' }));
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.documento;
                return newErrors;
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Obter valores formatados para exibição
    const getDisplayValue = (name: keyof CheckoutFormData): string => {
        const val = formData[name];
        if (typeof val !== 'string') return '';
        if (name === 'cep') return maskCEP(val);
        if (name === 'documento') return formData.tipoDocumento === 'CPF' ? maskCPF(val) : maskCNPJ(val);
        return val;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userId = user.id || user.googleId;
            // 1. Salvar endereço se solicitado
            if (formData.saveAddress && isAddingNewAddress && userId) {
                const addrData: Address = {
                    label: 'Principal',
                    street: formData.rua,
                    number: formData.numero,
                    neighborhood: formData.bairro,
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    complement: formData.complemento
                };
                await authService.address.create(userId, addrData);
            }

            // 2. Preparar dados do pedido
            const order: CreateOrderData = {
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity, variantId: i.variantId })),
                email: formData.email,
                customerName: `${formData.nome} ${formData.sobrenome}`,
                shippingAddress: {
                    street: formData.rua,
                    number: formData.numero,
                    city: formData.cidade,
                    state: formData.estado,
                    zipCode: formData.cep,
                    neighborhood: formData.bairro,
                    complement: formData.complemento
                },
                // @ts-ignore - Estendendo se o backend usar 'shipping' opcionalmente
                shipping: {
                    service: currentShipping?.provider,
                    price: currentShipping?.price
                },
                paymentMethod: formData.metodoPagamento,
                couponCode: appliedCoupon?.code,
                saveAddress: formData.saveAddress,
                saveCard: formData.saveCard,
                // @ts-ignore
                documentType: formData.tipoDocumento,
                // @ts-ignore
                documentNumber: formData.documento
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
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-12 lg:col-span-6 space-y-1.5 group">
                                    <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">
                                        E-mail para acompanhamento
                                    </label>
                                    <input
                                        type="email" name="email" required placeholder="exemplo@email.com"
                                        value={formData.email} onChange={handleInputChange}
                                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                    />
                                </div>
                                <div className="md:col-span-12 lg:col-span-6 grid grid-cols-12 gap-4">
                                    <div className="col-span-4 space-y-1.5">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">
                                            Tipo
                                        </label>
                                        <select
                                            name="tipoDocumento"
                                            value={formData.tipoDocumento}
                                            onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-3 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <option value="CPF">CPF</option>
                                            <option value="CNPJ">CNPJ</option>
                                        </select>
                                    </div>
                                    <div className="col-span-8 space-y-1.5 group relative">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">
                                            {formData.tipoDocumento}
                                        </label>
                                        <input
                                            type="text" name="documento" required placeholder={formData.tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                            value={getDisplayValue('documento')} onChange={handleInputChange}
                                            className={`w-full border ${formErrors.documento ? 'border-red-500' : 'border-[var(--azul-profundo)]/10'} bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200`}
                                        />
                                        {formErrors.documento && (
                                            <p className="absolute -bottom-5 right-1 text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">
                                                {formErrors.documento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">2</span>
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
                                            setFormData(prev => ({
                                                ...prev,
                                                rua: '',
                                                numero: '',
                                                bairro: '',
                                                complemento: '',
                                                cidade: '',
                                                estado: '',
                                                cep: ''
                                            }));
                                        }}
                                        className={`p-4 border border-dashed flex items-center justify-center gap-2 font-lato text-[10px] uppercase tracking-widest transition-all ${isAddingNewAddress ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/40 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/60'}`}
                                    >
                                        + Novo Endereço
                                    </button>
                                </div>
                            )}

                            {isAddingNewAddress && (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-4">
                                    <div className="md:col-span-6 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Nome</label>
                                        <input
                                            type="text" name="nome" required placeholder="Seu nome"
                                            value={formData.nome} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-6 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Sobrenome</label>
                                        <input
                                            type="text" name="sobrenome" required placeholder="Seu sobrenome"
                                            value={formData.sobrenome} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">CEP</label>
                                        <input
                                            type="text" name="cep" required placeholder="00000-000"
                                            value={getDisplayValue('cep')} onChange={handleInputChange}
                                            className={`w-full border ${formErrors.cep ? 'border-red-500' : 'border-[var(--azul-profundo)]/10'} bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200`}
                                        />
                                        <div className="min-h-[16px] mt-1 pr-1">
                                            {formErrors.cep && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1 text-right">{formErrors.cep}</p>}
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Rua / Logradouro</label>
                                        <input
                                            type="text" name="rua" required placeholder="Nome da rua"
                                            value={formData.rua} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Nº</label>
                                        <input
                                            type="text" name="numero" required placeholder="123"
                                            value={formData.numero} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-5 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Bairro</label>
                                        <input
                                            type="text" name="bairro" required placeholder="Bairro"
                                            value={formData.bairro} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Complemento</label>
                                        <input
                                            type="text" name="complemento" placeholder="Apto, Bloco..."
                                            value={formData.complemento} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-9 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">Cidade</label>
                                        <input
                                            type="text" name="cidade" required placeholder="Cidade"
                                            value={formData.cidade} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1.5 group">
                                        <label className="block font-lato text-[11px] uppercase tracking-wider text-[var(--azul-profundo)]/60 font-bold ml-1">UF</label>
                                        <input
                                            type="text" name="estado" required placeholder="UF"
                                            value={formData.estado} onChange={handleInputChange}
                                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-5 py-3.5 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] focus:ring-1 focus:ring-[var(--dourado-suave)]/20 transition-all duration-200 uppercase"
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
                            {mpLoading ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 size={32} className="animate-spin text-[var(--dourado-suave)]" />
                                </div>
                            ) : user.id ? (
                                <div className="space-y-4">
                                    {(!config || config.pixActive) && (
                                        <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'pix' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                            <input type="radio" name="metodoPagamento" value="pix" checked={formData.metodoPagamento === 'pix'} onChange={handleInputChange as any} className="accent-[var(--azul-profundo)]" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm italic font-bold">PIX</div>
                                                <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Pix com {effectivePixDiscountPercent || 5}% de desconto</span>
                                            </div>
                                        </label>
                                    )}

                                    {(!config || config.cardActive) && (
                                        <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${formData.metodoPagamento === 'card' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                                            <input type="radio" name="metodoPagamento" value="card" checked={formData.metodoPagamento === 'card'} onChange={handleInputChange as any} className="accent-[var(--azul-profundo)]" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm">
                                                    <CreditCard size={20} />
                                                </div>
                                                <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Cartão de Crédito / Débito</span>
                                            </div>
                                        </label>
                                    )}

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
                            ) : (
                                <div className="p-8 border border-[var(--azul-profundo)]/10 bg-gray-50/50 text-center animate-in fade-in zoom-in-95 duration-700">
                                    <p className="font-lato text-xs text-[var(--azul-profundo)]/40 uppercase tracking-widest">Aguardando identificação para processar pagamento</p>
                                </div>
                            )}
                        </section>

                        {!user.id && (
                            <div className="p-6 border border-dashed border-[var(--azul-profundo)]/20 bg-white/50 flex flex-col items-center gap-4 text-center mt-8 group hover:border-[var(--dourado-suave)]/40 transition-all duration-500">
                                <div className="w-10 h-10 rounded-full bg-[var(--azul-profundo)]/5 flex items-center justify-center text-[var(--azul-profundo)]/40 group-hover:bg-[var(--dourado-suave)]/10 group-hover:text-[var(--dourado-suave)] transition-all">
                                    <UserIcon size={18} />
                                </div>
                                <div className="max-w-xs">
                                    <p className="font-playfair text-lg text-[var(--azul-profundo)] mb-1">Finalização Restrita</p>
                                    <p className="font-lato text-[10px] text-[var(--azul-profundo)]/50 uppercase tracking-widest leading-relaxed">
                                        Logue para concluir seu pedido no Ateliê.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                                    className="text-[var(--dourado-suave)] font-lato text-[9px] font-bold uppercase tracking-widest border-b border-[var(--dourado-suave)] pb-1 hover:text-[var(--azul-profundo)] hover:border-[var(--azul-profundo)] transition-all"
                                >
                                    Entrar / Cadastrar
                                </button>
                            </div>
                        )}
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
                                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = '/images/default.png'; }}
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

                                    {user.id && effectivePixDiscountPercent > 0 && (
                                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                                            <span>Desconto Pix ({effectivePixDiscountPercent}%)</span>
                                            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal * (effectivePixDiscountPercent / 100))}</span>
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

                                {(!user.id) ? (
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                                        className="w-full bg-[var(--dourado-suave)] text-white py-5 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[var(--azul-profundo)] transition-all flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        Identifique-se para finalizar
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={
                                            loading ||
                                            !currentShipping ||
                                            !formData.email ||
                                            !formData.nome ||
                                            !formData.documento ||
                                            Object.keys(formErrors).length > 0 ||
                                            (formData.metodoPagamento === 'card' && isAddingNewCard && !isConfigured)
                                        }
                                        className="w-full bg-[var(--azul-profundo)] text-white py-5 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[var(--dourado-suave)] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Finalizar Pedido'}
                                    </button>
                                )}
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
