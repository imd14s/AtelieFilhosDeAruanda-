import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Como faço para comprar os produtos?",
            answer: "Atualmente, todas as nossas vendas são realizadas exclusivamente através da TikTok Shop. Visite nosso perfil @atelie_filhos_de_aruanda no TikTok para ver nossos produtos disponíveis e realizar sua compra."
        },
        {
            question: "Qual o prazo de entrega?",
            answer: "O prazo de entrega varia de acordo com a sua região e o método de envio escolhido. Geralmente, os pedidos são processados em até 2 dias úteis e a entrega ocorre entre 3 a 15 dias úteis, dependendo da modalidade (SEDEX ou PAC)."
        },
        {
            question: "Os produtos são artesanais?",
            answer: "Sim! Todos os nossos produtos são feitos artesanalmente com muito cuidado, respeito e axé. Cada peça é única e criada com dedicação para iluminar o seu caminho espiritual."
        },
        {
            question: "Posso personalizar um produto?",
            answer: "Sim, aceitamos encomendas personalizadas! Entre em contato conosco através da TikTok Shop ou pelos nossos telefones (11) 96321-2172 ou (11) 95348-2232 para discutir suas necessidades."
        },
        {
            question: "Como funciona a política de trocas e devoluções?",
            answer: "Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução, desde que o produto esteja sem uso e na embalagem original. Todas as solicitações devem ser feitas através da TikTok Shop."
        },
        {
            question: "Os produtos têm garantia?",
            answer: "Garantimos a qualidade de todos os nossos produtos artesanais. Caso receba um item com defeito de fabricação, entre em contato imediatamente através da TikTok Shop para que possamos resolver a situação."
        },
        {
            question: "Vocês enviam para todo o Brasil?",
            answer: "Sim! Realizamos entregas para todo o território nacional através dos Correios."
        },
        {
            question: "Como posso rastrear meu pedido?",
            answer: "Após o envio, você receberá um código de rastreamento por e-mail ou através da plataforma TikTok Shop. Com esse código, você pode acompanhar seu pedido no site dos Correios."
        },
        {
            question: "Quais formas de pagamento são aceitas?",
            answer: "As formas de pagamento disponíveis são aquelas oferecidas pela TikTok Shop, incluindo cartão de crédito, PIX e outras opções da plataforma."
        },
        {
            question: "Posso retirar o produto pessoalmente?",
            answer: "No momento, trabalhamos apenas com envios através dos Correios. Não oferecemos opção de retirada presencial."
        },
        {
            question: "Como entro em contato para tirar dúvidas?",
            answer: "Você pode entrar em contato conosco através da TikTok Shop, pelos telefones (11) 96321-2172 ou (11) 95348-2232, ou pelo e-mail mundodearuanda@gmail.com."
        },
        {
            question: "Vocês têm loja física?",
            answer: "Não, somos um ateliê online. Todas as nossas vendas são realizadas através da TikTok Shop e as entregas são feitas pelos Correios."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[var(--branco-off-white)]">
            <SEO
                title="Perguntas Frequentes"
                description="Tire suas dúvidas sobre nossos produtos, envios e políticas."
            />

            {/* Header */}
            <header className="bg-[var(--azul-profundo)] text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/" className="text-[var(--dourado-suave)] hover:underline text-sm mb-4 inline-block">
                        ← Voltar para Home
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <HelpCircle size={48} className="text-[var(--dourado-suave)]" />
                        <h1 className="font-playfair text-4xl md:text-5xl">Perguntas Frequentes</h1>
                    </div>
                    <p className="font-lato text-lg text-white/70">
                        Encontre respostas para as dúvidas mais comuns
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Notice Banner */}
                <div className="bg-[var(--dourado-suave)]/10 border-l-4 border-[var(--dourado-suave)] p-6 mb-12 rounded-r">
                    <div className="flex items-start gap-4">
                        <ExternalLink className="text-[var(--dourado-suave)] shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-2">
                                Não encontrou sua resposta?
                            </h3>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70 mb-3">
                                Entre em contato conosco através da{" "}
                                <a
                                    href="https://www.tiktok.com/@atelie_filhos_de_aruanda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--dourado-suave)] hover:underline font-semibold"
                                >
                                    TikTok Shop
                                </a>
                                {" "}ou pelos telefones (11) 96321-2172 / (11) 95348-2232
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--azul-profundo)]/10"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--azul-profundo)]/5 transition-colors"
                            >
                                <h3 className="font-lato font-semibold text-[var(--azul-profundo)] pr-4">
                                    {faq.question}
                                </h3>
                                {openIndex === index ? (
                                    <ChevronUp className="text-[var(--dourado-suave)] shrink-0" size={20} />
                                ) : (
                                    <ChevronDown className="text-[var(--dourado-suave)] shrink-0" size={20} />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4 pt-2 border-t border-[var(--azul-profundo)]/10">
                                    <p className="font-lato text-sm text-[var(--azul-profundo)]/70 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-16 bg-[var(--azul-profundo)] text-white p-8 rounded-lg text-center">
                    <h2 className="font-playfair text-2xl mb-4">Ainda tem dúvidas?</h2>
                    <p className="font-lato text-white/70 mb-6">
                        Nossa equipe está pronta para ajudar você!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://www.tiktok.com/@atelie_filhos_de_aruanda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[var(--dourado-suave)] text-[var(--azul-profundo)] px-6 py-3 rounded-lg font-lato font-semibold hover:bg-[var(--dourado-suave)]/90 transition-colors"
                        >
                            Falar no TikTok
                            <ExternalLink size={16} />
                        </a>
                        <a
                            href="mailto:mundodearuanda@gmail.com"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-lato font-semibold hover:bg-white/20 transition-colors"
                        >
                            Enviar E-mail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
