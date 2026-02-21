import React from 'react';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
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
                                <p className="text-gray-600">(11) 96321-2172</p>
                                <p className="text-gray-600">(11) 95348-2232</p>
                                <p className="text-xs text-gray-400 mt-1">Segunda a Sexta, das 9h às 18h</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">E-mail</h3>
                                <p className="text-gray-600">mundodearuanda@gmail.com</p>
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
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nome Completo</label>
                                <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="Seu nome" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">E-mail</label>
                                <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="seu@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Assunto</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                                    <option>Dúvida sobre produto</option>
                                    <option>Status do Pedido</option>
                                    <option>Trocas e Devoluções</option>
                                    <option>Elogios / Sugestões</option>
                                    <option>Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Mensagem</label>
                                <textarea rows="4" required className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" placeholder="Como podemos te ajudar?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-[var(--dourado-suave)] hover:bg-[#b08d40] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2">
                                Enviar Mensagem <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
