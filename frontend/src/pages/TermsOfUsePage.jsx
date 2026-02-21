import React from 'react';
import SEO from '../components/SEO';
import { FileText } from 'lucide-react';

const TermsOfUsePage = () => {
    return (
        <div className="w-full bg-[var(--branco-off-white)] pt-12 pb-24 font-lato text-[var(--azul-profundo)]">
            <SEO title="Termos de Uso | Ateliê Filhos de Aruanda" description="Termos de uso da plataforma." />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[var(--dourado-suave)]/20 text-[var(--dourado-suave)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} />
                    </div>
                    <h1 className="font-playfair text-4xl mb-4">Termos de Uso</h1>
                    <p className="text-gray-600">Regras e políticas de utilização do nosso serviço.</p>
                </div>

                <div className="bg-white p-8 shadow-sm border border-gray-100 rounded-lg space-y-6 text-gray-700 text-sm leading-relaxed text-justify">
                    <p>
                        Bem-vindo(a) ao Ateliê Filhos de Aruanda. Ao acessar e utilizar este site, você concorda em cumprir e vincular-se aos nossos termos e condições.
                    </p>

                    <h3 className="font-bold text-gray-800 text-lg mt-4">1. Privacidade e Segurança</h3>
                    <p>
                        Coletamos apenas as informações essenciais para a concretização das suas compras. Não armazenamos os dados diretos dos seus cartões de crédito. A privacidade da sua jornada e ritos aqui conosco é totalmente respeitada.
                    </p>

                    <h3 className="font-bold text-gray-800 text-lg mt-4">2. Propriedade Intelectual</h3>
                    <p>
                        Todo o material visual, logotipo, textos e imagens de produtos apresentados neste site são de propriedade exclusiva do Ateliê Filhos de Aruanda. Sendo proibida cópia, reprodução ou distribuição sem nossa expressa autorização.
                    </p>

                    <h3 className="font-bold text-gray-800 text-lg mt-4">3. Variação Artesanal</h3>
                    <p>
                        Devido à natureza artesanal de muitos dos nossos itens, pequenas variações em tamanho, cores, detalhes de modelagem e padrões podem ocorrer se comparadas com as fotografias do anúncio.
                    </p>

                    <h3 className="font-bold text-gray-800 text-lg mt-4">4. Cancelamento ou Recusa de Pedidos</h3>
                    <p>
                        O Ateliê reserva-se o direito de recusar qualquer pedido feito. Se houver erro de inventário (falta de matéria-prima) ou qualquer outra interrupção, faremos o reembolso integral de imediato e notificaremos o cliente.
                    </p>

                    <p className="pt-4 border-t border-gray-100 text-gray-500 mt-6">
                        Última atualização: 20 de Fevereiro de 2026.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
