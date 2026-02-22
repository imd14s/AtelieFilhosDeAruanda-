import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import contactService from '../services/contactService';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Dúvida sobre produto', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        setSending(true);
        setError('');
        try {
            await contactService.send(formData);
            setSent(true);
        } catch (err) {
            setError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
        }
        setSending(false);
    };

    return (
        <div className="w-full bg-[var(--branco-off-white)] pt-12 pb-24 font-lato text-[var(--azul-profundo)]">
            <SEO title="Fale Conosco | Ateliê Filhos de Aruanda" description="Entre em contato com o Ateliê Filhos de Aruanda." />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-playfair text-4xl text-center mb-4">Fale Conosco</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Estamos aqui para ajudar! Se você tem alguma dúvida, sugestão ou precisa de assistência com o seu pedido, entre em contato conosco pelos canais abaixo.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Informações de Contato */}
                    <div className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="font-playfair text-2xl mb-6 text-[var(--dourado-suave)]">Nossos Canais</h2>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Phone className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Telefone / WhatsApp</h3>
                                <a href="https://wa.me/5511963212172" className="text-gray-600 hover:text-blue-500 transition-colors block">(11) 96321-2172</a>
                                <a href="https://wa.me/5511953482232" className="text-gray-600 hover:text-blue-500 transition-colors block">(11) 95348-2232</a>
                                <p className="text-xs text-gray-400 mt-1">Segunda a Sexta, das 9h às 18h</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">E-mail</h3>
                                <a href="mailto:mundodearuanda@gmail.com" className="text-gray-600 hover:text-blue-500 transition-colors">mundodearuanda@gmail.com</a>
                                <p className="text-xs text-gray-400 mt-1">Respondemos em até 24h úteis</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <MapPin className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Atendimento</h3>
                                <p className="text-gray-600">Loja 100% Online</p>
                                <p className="text-gray-600 flex items-center gap-1">São Paulo, SP</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário de Contato */}
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="font-playfair text-2xl mb-6 text-[var(--dourado-suave)]">Envie uma Mensagem</h2>

                        {sent ? (
                            <div className="text-center py-12">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mensagem Enviada!</h3>
                                <p className="text-gray-500 text-sm mb-6">Recebemos sua mensagem e responderemos em até 24h úteis no e-mail informado.</p>
                                <button
                                    onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: 'Dúvida sobre produto', message: '' }); }}
                                    className="text-sm text-blue-500 hover:underline font-semibold"
                                >
                                    Enviar outra mensagem
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Nome Completo *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="Seu nome" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">E-mail *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="seu@email.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Assunto</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                                        <option>Dúvida sobre produto</option>
                                        <option>Status do Pedido</option>
                                        <option>Trocas e Devoluções</option>
                                        <option>Elogios / Sugestões</option>
                                        <option>Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Mensagem *</label>
                                    <textarea name="message" rows="4" value={formData.message} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="Como podemos te ajudar?"></textarea>
                                </div>
                                <button type="submit" disabled={sending} className="w-full bg-[var(--dourado-suave)] hover:bg-[#b08d40] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                    {sending ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <>Enviar Mensagem <Send size={16} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
