import React, { useState } from 'react';
import SEO from '../components/SEO';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full justify-between items-center py-5 text-left font-bold text-gray-800 hover:text-[var(--dourado-suave)] transition-colors focus:outline-none"
            >
                <span className="pr-4">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
            </button>

            {isOpen && (
                <div className="pb-5 text-gray-600 leading-relaxed font-lato">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQPage = () => {
    const faqs = [
        {
            question: "O Ateliê Filhos de Aruanda atende pedidos no atacado?",
            answer: "Sim! Trabalhamos com descontos especiais para pedidos em quantidade (Terreiros, Lojistas). Entre em contato através do nosso e-mail ou WhatsApp para enviarmos nossa tabela de atacado."
        },
        {
            question: "Os produtos são consagrados antes do envio?",
            answer: "Nossos produtos (guias, imagens, velas) são preparados em um ambiente de paz, respeito e axé. No entanto, acreditamos que a consagração final, cruzamento e ativação deve ser feita por você ou pelo seu líder espiritual, para se conectar perfeitamente com a sua energia e Orixá/Entidade."
        },
        {
            question: "Como faço para rastrear o meu pedido?",
            answer: "Assim que o pagamento for aprovado e o pedido despachado, você receberá o código de rastreamento por e-mail. Também é possível ver o acompanhamento acessando 'Meu Perfil' > 'Compras'."
        },
        {
            question: "Posso solicitar uma guia personalizada com as cores da minha entidade?",
            answer: "Com certeza! Adoramos criar produtos exclusivos. Fale conosco pelo WhatsApp antes de fechar a compra para entendermos a sua necessidade e darmos um orçamento sob medida."
        },
        {
            question: "É seguro comprar aqui?",
            answer: "Sim. A nossa loja utiliza certificado SSL de ponta a ponta. Seus dados de pagamento são criptografados através de gateways de pagamento extremamente confiáveis."
        }
    ];

    return (
        <div className="w-full bg-[var(--branco-off-white)] pt-12 pb-24 font-lato text-[var(--azul-profundo)]">
            <SEO title="Perguntas Frequentes | Ateliê Filhos de Aruanda" description="Encontre respostas para as principais dúvidas." />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[var(--dourado-suave)]/20 text-[var(--dourado-suave)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="font-playfair text-4xl mb-4">Perguntas Frequentes</h1>
                    <p className="text-gray-600">As dúvidas mais comuns da nossa comunidade.</p>
                </div>

                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
