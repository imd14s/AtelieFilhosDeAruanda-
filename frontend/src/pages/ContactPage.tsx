import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Instagram, Facebook } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import contactService from '../services/contactService';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const ContactPage: React.FC = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: 'Dúvida sobre produto',
        message: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await contactService.send(formData);
            addToast("Mensagem enviada com sucesso! Em breve entraremos em contato.", "success");
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Erro ao enviar contato:", error);
            addToast("Falha ao enviar mensagem. Tente novamente mais tarde.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F7F7F4] min-h-screen">
            <SEO
                title="Contato | Ateliê Filhos de Aruanda"
                description="Entre em contato com o Ateliê Filhos de Aruanda. Estamos aqui para tirar suas dúvidas sobre produtos, pedidos e nossa arte."
            />

            {/* Header */}
            <section className="bg-[#0f2A44] py-20 text-center px-4">
                <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Fale Conosco</h1>
                <p className="font-lato text-[#F7F7F4]/60 uppercase tracking-[0.2em] text-xs">Estamos aqui para ouvir você</p>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

                    {/* Informações de Contato */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="font-playfair text-3xl text-[#0f2A44] mb-8">Informações de Contato</h2>
                            <p className="font-lato text-gray-600 leading-relaxed mb-12">
                                Dúvidas sobre sua guia, velas personalizadas ou acompanhamento de pedido? Nossa equipe está pronta para ajudar você com todo o carinho e respeito.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm shadow-md text-[#C9A24D] group-hover:bg-[#0f2A44] group-hover:text-white transition-all duration-300">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-playfair text-lg text-[#0f2A44] mb-1">WhatsApp</h4>
                                    <p className="font-lato text-sm text-gray-500">(11) 99999-9999</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm shadow-md text-[#C9A24D] group-hover:bg-[#0f2A44] group-hover:text-white transition-all duration-300">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-playfair text-lg text-[#0f2A44] mb-1">E-mail</h4>
                                    <p className="font-lato text-sm text-gray-500">contato@ateliearuanda.com.br</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm shadow-md text-[#C9A24D] group-hover:bg-[#0f2A44] group-hover:text-white transition-all duration-300">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-playfair text-lg text-[#0f2A44] mb-1">Nosso Ateliê</h4>
                                    <p className="font-lato text-sm text-gray-500">São Paulo, SP - Atendimento Online</p>
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        <div className="pt-8 border-t border-[#0f2A44]/5">
                            <h4 className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#C9A24D] mb-6">Siga-nos</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-sm text-[#0f2A44] hover:bg-[#C9A24D] hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-sm text-[#0f2A44] hover:bg-[#C9A24D] hover:text-white transition-all">
                                    <Facebook size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Formulário */}
                    <div className="bg-white p-10 md:p-12 shadow-xl rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7F7F4] -mr-16 -mt-16 rotate-45"></div>

                        <h3 className="font-playfair text-2xl text-[#0f2A44] mb-8 relative z-10">Envie uma Mensagem</h3>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Nome</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border-b border-gray-200 py-2 font-lato text-sm focus:border-[#C9A24D] outline-none transition-colors"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-lato text-[10px] uppercase tracking-widest text-gray-400">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border-b border-gray-200 py-2 font-lato text-sm focus:border-[#C9A24D] outline-none transition-colors"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Assunto</label>
                                <select
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full border-b border-gray-200 py-2 font-lato text-sm focus:border-[#C9A24D] outline-none transition-colors bg-transparent"
                                >
                                    <option value="">Selecione um assunto</option>
                                    <option value="Dúvida sobre Produto">Dúvida sobre Produto</option>
                                    <option value="Acompanhamento de Pedido">Acompanhamento de Pedido</option>
                                    <option value="Personalização">Personalização</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Mensagem</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full border border-gray-100 bg-[#F7F7F4]/50 p-4 font-lato text-sm focus:border-[#C9A24D] outline-none transition-colors resize-none"
                                    placeholder="Como podemos ajudar?"
                                ></textarea>
                            </div>

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full py-4 group"
                            >
                                Enviar Mensagem
                                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Mapa Placeholder */}
            <section className="h-96 bg-[#0f2A44]/5 flex items-center justify-center border-t border-[#0f2A44]/5">
                <div className="text-center">
                    <MapPin className="text-[#C9A24D] mx-auto mb-4" size={32} />
                    <p className="font-lato text-[10px] uppercase tracking-[0.3em] text-[#0f2A44]/40">Nossa Base de Operações</p>
                    <p className="font-playfair text-xl text-[#0f2A44]">São Paulo - Atendimento para todo o Brasil</p>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
