import React from 'react';
import SEO from '../components/SEO';
import { RefreshCcw } from 'lucide-react';

const ReturnsPolicyPage: React.FC = () => {
    return (
        <div className="w-full bg-[var(--branco-off-white)] pt-12 pb-24 font-lato text-[var(--azul-profundo)]">
            <SEO title="Trocas e Devoluções | Ateliê Filhos de Aruanda" description="Condições gerais para trocas e devoluções." />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[var(--dourado-suave)]/20 text-[var(--dourado-suave)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCcw size={32} />
                    </div>
                    <h1 className="font-playfair text-4xl mb-4">Trocas e Devoluções</h1>
                    <p className="text-gray-600">Nosso compromisso com a sua satisfação.</p>
                </div>

                <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-lg space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">1. Direito de Arrependimento</h2>
                        <p>
                            De acordo com o Código de Defesa do Consumidor, você possui o direito de arrependimento em até <strong>7 dias corridos</strong> após o recebimento do produto. O produto deve ser devolvido em sua embalagem original, sem indícios de uso, com todas as etiquetas e acessórios.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">2. Produtos com Defeito</h2>
                        <p>
                            Embalamos nossos produtos artesanais e frágeis com o máximo de proteção. Se ainda assim o produto chegar danificado ou com defeito de fabricação, pedimos que entre em contato conosco imediatamente (em até 7 dias) enviando fotos do produto e da embalagem danificada. Avaliaremos o caso prontamente para o reenvio ou reembolso.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">3. Processo de Solicitação</h2>
                        <p>
                            Para solicitar uma troca ou devolução, acesse a página <strong>Fale Conosco</strong> ou envie um e-mail para <a href="mailto:mundodearuanda@gmail.com" className="text-blue-500 hover:underline">mundodearuanda@gmail.com</a> informando o número do pedido e o motivo. Nossa equipe fornecerá as instruções de postagem (logística reversa).
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">4. Estorno</h2>
                        <p>
                            O estorno do valor será processado assim que recebermos e analisarmos o produto devolvido. Para compras no cartão de crédito, o reembolso pode constar em até duas faturas subsequentes. Para pagamentos em PIX ou boleto, o depósito será realizado na conta do titular em até 5 dias úteis.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReturnsPolicyPage;
