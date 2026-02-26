import React from 'react';
import SEO from '../components/SEO';
import { Package } from 'lucide-react';

const ShippingPolicyPage: React.FC = () => {
    return (
        <div className="w-full bg-[var(--branco-off-white)] pt-12 pb-24 font-lato text-[var(--azul-profundo)]">
            <SEO title="Políticas de Envio | Ateliê Filhos de Aruanda" description="Saiba como funcionam os nossos envios." />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[var(--dourado-suave)]/20 text-[var(--dourado-suave)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} />
                    </div>
                    <h1 className="font-playfair text-4xl mb-4">Políticas de Envio</h1>
                    <p className="text-gray-600">Entenda os prazos, custos e métodos de entrega do seu Axé.</p>
                </div>

                <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-lg space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">1. Prazo de Processamento</h2>
                        <p>
                            Todos os nossos produtos são carinhosamente preparados, energizados e embalados após a confirmação do pagamento. O prazo de processamento para produtos em estoque é de <strong>1 a 3 dias úteis</strong>.
                            Para produtos sob encomenda (artesanais exclusivos), o prazo será informado na página do produto (geralmente de 7 a 15 dias úteis).
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">2. Formas de Envio</h2>
                        <p>
                            Trabalhamos em parceria com os Correios e transportadoras selecionadas para garantir que seus produtos cheguem com segurança a qualquer lugar do Brasil. Ao finalizar a sua compra, serão apresentadas as opções disponíveis para o seu CEP (PAC, SEDEX, Transportadora), com os respectivos custos e prazos.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">3. Rastreamento</h2>
                        <p>
                            Assim que o seu pedido for despachado, você receberá um e-mail com o código de rastreamento. Você também pode acompanhar o status da sua entrega diretamente pela aba <strong>Minhas Compras</strong> no seu Perfil.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-xl mb-3 text-[var(--dourado-suave)]">4. Possíveis Atrasos</h2>
                        <p>
                            Nós nos esforçamos para que você receba o seu pedido o mais rápido possível. No entanto, prazos de entrega são estimativas e podem sofrer alterações devido a fatores climáticos, áreas de difícil acesso ou greves dos serviços de entrega. Faremos o nosso melhor para te ajudar em caso de atrasos.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
