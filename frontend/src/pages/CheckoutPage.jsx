import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { shippingSelected, cep } = location.state || {};

    const [cart, setCart] = useState(storeService.cart.get());
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        nome: '',
        sobrenome: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: cep || '',
        metodoPagamento: 'pix'
    });

    const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + (shippingSelected?.price || 0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                customer: formData,
                items: cart.items,
                shipping: shippingSelected,
                total: total
            };

            const result = await storeService.createOrder(orderData);
            setOrderComplete(result || { id: 'AUR-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
            storeService.cart.clear();
        } catch (error) {
            console.error(error);
            alert("Erro ao processar o pedido. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-[#F7F7F4] flex flex-col items-center justify-center p-4 text-center">
                <SEO title="Pedido Confirmado" />
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h1 className="font-playfair text-4xl text-[#0f2A44] mb-4">Que o Axé te acompanhe!</h1>
                <p className="font-lato text-base text-[#0f2A44]/60 mb-8 max-w-md">
                    Seu pedido <strong>#{orderComplete.id || orderComplete.orderId}</strong> foi recebido com sucesso.
                    Você receberá um e-mail com os detalhes e o código de rastreio em breve.
                </p>
                <Link to="/" className="bg-[#0f2A44] text-white px-10 py-4 font-lato text-xs uppercase tracking-widest hover:bg-[#C9A24D] transition-all">
                    Voltar para a Início
                </Link>
            </div>
        );
    }

    if (cart.items.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen bg-[#F7F7F4] flex flex-col items-center justify-center p-4">
                <SEO title="Checkout" />
                <p className="font-playfair text-xl text-[#0f2A44] mb-8">Sua sacola está vazia.</p>
                <Link to="/store" className="text-[#C9A24D] font-lato text-xs uppercase tracking-widest border-b border-[#C9A24D]">Ir para a Loja</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F7F4] pt-12 pb-24 px-4">
            <SEO title="Checkout" description="Finalize sua compra com segurança no Ateliê Filhos de Aruanda." />
            <div className="max-w-7xl mx-auto">

                <Link to="/" className="inline-flex items-center gap-2 text-[#0f2A44]/40 hover:text-[#0f2A44] transition-colors mb-12">
                    <ChevronLeft size={16} />
                    <span className="font-lato text-[10px] uppercase tracking-widest">Voltar</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Formulário */}
                    <div className="flex-[1.5] space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#0f2A44] text-white flex items-center justify-center font-playfair text-sm">1</span>
                                <h2 className="font-playfair text-2xl text-[#0f2A44]">Informações de Contato</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <input
                                    type="email" name="email" required placeholder="E-mail para acompanhamento"
                                    value={formData.email} onChange={handleInputChange}
                                    className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                />
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#0f2A44] text-white flex items-center justify-center font-playfair text-sm">2</span>
                                <h2 className="font-playfair text-2xl text-[#0f2A44]">Endereço de Entrega</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text" name="nome" required placeholder="Nome"
                                    value={formData.nome} onChange={handleInputChange}
                                    className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                />
                                <input
                                    type="text" name="sobrenome" required placeholder="Sobrenome"
                                    value={formData.sobrenome} onChange={handleInputChange}
                                    className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                />
                                <input
                                    type="text" name="endereco" required placeholder="Endereço e Número"
                                    value={formData.endereco} onChange={handleInputChange}
                                    className="md:col-span-2 w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                />
                                <input
                                    type="text" name="cidade" required placeholder="Cidade"
                                    value={formData.cidade} onChange={handleInputChange}
                                    className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <input
                                        type="text" name="estado" required placeholder="UF"
                                        value={formData.estado} onChange={handleInputChange}
                                        className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                    />
                                    <input
                                        type="text" name="cep" required placeholder="CEP"
                                        value={formData.cep} onChange={handleInputChange}
                                        className="w-full border border-[#0f2A44]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[#C9A24D]"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#0f2A44] text-white flex items-center justify-center font-playfair text-sm">3</span>
                                <h2 className="font-playfair text-2xl text-[#0f2A44]">Pagamento</h2>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-6 border border-[#C9A24D] bg-[#C9A24D]/5 cursor-pointer">
                                    <input type="radio" name="metodoPagamento" value="pix" checked={formData.metodoPagamento === 'pix'} onChange={handleInputChange} className="accent-[#0f2A44]" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0f2A44] shadow-sm italic font-bold">PIX</div>
                                        <span className="font-lato text-sm font-bold uppercase tracking-widest text-[#0f2A44]">Pix com 5% de desconto</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-4 p-6 border border-[#0f2A44]/10 bg-white opacity-50 cursor-not-allowed">
                                    <input type="radio" name="metodoPagamento" value="card" disabled className="accent-[#0f2A44]" />
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={24} className="text-[#0f2A44]/40" />
                                        <span className="font-lato text-sm uppercase tracking-widest text-[#0f2A44]/40">Cartão de Crédito (Breve)</span>
                                    </div>
                                </label>
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
                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
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
                                    <div className="flex justify-between text-[#0f2A44] font-lato text-lg font-bold pt-4">
                                        <span>Total</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                    </div>
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
                                    className="w-full bg-[#0f2A44] text-white py-5 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[#C9A24D] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Pedido'}
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
