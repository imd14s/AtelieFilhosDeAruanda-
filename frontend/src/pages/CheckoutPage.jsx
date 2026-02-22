import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShoppingBag, Truck, ShieldCheck, Check, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { storeService } from '../services/storeService';
import marketingService from '../services/marketingService';
import SEO from '../components/SEO';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { shippingSelected, cep } = location.state || {};

    const [cart, setCart] = useState(storeService.cart.get());
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
        metodoPagamento: 'pix'
    });

    React.useEffect(() => {
        if (user.id) {
            setFormData(prev => ({
                ...prev,
                email: user.email || prev.email,
                nome: user.name?.split(' ')[0] || prev.nome,
                sobrenome: user.name?.split(' ').slice(1).join(' ') || prev.sobrenome
            }));
        }
    }, []);

    const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE'
            ? (subtotal * (appliedCoupon.value / 100))
            : appliedCoupon.value)
        : 0;
    const total = subtotal + (shippingSelected?.price || 0) - discount;

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
            const order = {
                items: cart.items.map(i => ({ productId: i.id, quantity: i.quantity })),
                customerEmail: formData.email,
                shippingAddress: `${formData.endereco}, ${formData.cidade} - ${formData.estado} (CEP: ${formData.cep})`,
                totalAmount: total,
                paymentMethod: formData.metodoPagamento
            };

            const result = await storeService.createOrder(order);
            setSuccessOrder(result);
            storeService.cart.clear(); // Limpa carrinho ao finalizar
        } catch (error) {
            console.error(error);
            window.dispatchEvent(new CustomEvent('show-alert', { detail: "Erro ao processar o pedido. Tente novamente." }));
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


    if (cart.items.length === 0 && !successOrder) {
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        value={formData.cep} onChange={handleInputChange}
                                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">3</span>
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
                                        <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Cartão de Crédito</span>
                                    </div>
                                </label>

                                {/* Formulário de Cartão Sensível */}
                                {formData.metodoPagamento === 'card' && (
                                    <div className="p-6 border border-[var(--azul-profundo)]/10 bg-white mt-4 animate-in fade-in slide-in-from-top-4">
                                        <h3 className="font-lato text-xs font-bold uppercase tracking-widest text-[var(--azul-profundo)] mb-6 flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-green-600" /> Transação Segura via Mercado Pago
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Número do Cartão</label>
                                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Nome Impresso no Cartão</label>
                                                <input type="text" placeholder="JOAO M SILVA" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] uppercase" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Validade (MM/AA)</label>
                                                <input type="text" placeholder="MM/AA" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                                <input type="text" placeholder="123" maxLength="4" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">CPF do Titular</label>
                                                <input type="text" placeholder="000.000.000-00" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Parcelas</label>
                                                <select className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]">
                                                    <option>1x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} sem juros</option>
                                                    <option>2x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / 2)} sem juros</option>
                                                    <option>3x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / 3)} sem juros</option>
                                                </select>
                                            </div>
                                        </div>
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
                                    {cart.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-start gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-16 bg-[#F7F7F4] overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image || '/images/default.png'}
                                                        alt=""
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

                                {!shippingSelected && (
                                    <div className="bg-amber-50 border border-amber-200 p-4 flex gap-3 text-amber-800">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <p className="text-[10px] uppercase tracking-wider leading-relaxed">
                                            Por favor, volte ao carrinho e selecione uma opção de frete para continuar.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !shippingSelected || !formData.email || !formData.nome}
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
