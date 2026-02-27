import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { productService } from '../services/productService';
import ReviewForm from '../components/ReviewForm';
import VerifiedBadge from '../components/VerifiedBadge';
import { Product } from '../types';

/**
 * ReviewSubmissionPage - Página dedicada para coleta de avaliações via token.
 * Integrada ao fluxo de 'Compra Verificada'.
 */
const ReviewSubmissionPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tokenData, setTokenData] = useState<import('../types/safeAny').SafeAny>(null);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const validate = async () => {
            if (!token) {
                setError('Token de avaliação não fornecido.');
                setLoading(false);
                return;
            }

            try {
                // 1. Validar Token
                const data = await productService.validateReviewToken(token);
                setTokenData(data);

                // 2. Buscar detalhes do produto
                const productDetail = await productService.getProductById(data.productId);
                setProduct(productDetail);

            } catch (err: import('../types/safeAny').SafeAny) {
                console.error("[ReviewSubmissionPage] Erro:", err);
                setError(err.response?.data?.message || 'Este link de avaliação é inválido ou já expirou.');
            } finally {
                setLoading(false);
            }
        };

        validate();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--branco-off-white)]">
                <Loader2 className="animate-spin text-[var(--dourado-suave)] mb-4" size={48} />
                <p className="font-playfair text-xl text-[var(--azul-profundo)] animate-pulse">Tecendo sua experiência...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--branco-off-white)] text-center">
                <div className="bg-white p-12 rounded-sm shadow-xl border border-red-100 max-w-md w-full space-y-6">
                    <AlertCircle size={64} className="mx-auto text-red-400" />
                    <h2 className="font-playfair text-3xl text-[var(--azul-profundo)]">Opa! Algo deu errado.</h2>
                    <p className="font-lato text-gray-500 leading-relaxed">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-[var(--azul-profundo)] text-white font-lato text-xs uppercase tracking-widest hover:bg-[var(--dourado-suave)] transition-all"
                    >
                        Voltar para a Loja
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--branco-off-white)] py-20 px-4">
            <div className="max-w-2xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4 border border-[var(--dourado-suave)]/20 text-[var(--dourado-suave)]">
                        <ShoppingBag size={32} />
                    </div>
                    <h1 className="font-playfair text-4xl text-[var(--azul-profundo)] uppercase tracking-widest leading-tight">Sua Voz no Axé</h1>
                    <p className="font-lato text-gray-500 max-w-md mx-auto">
                        Agradecemos pela sua confiança. Sua avaliação nos ajuda a manter a luz do nosso Ateliê sempre vibrante.
                    </p>
                    <div className="flex justify-center pt-2">
                        <VerifiedBadge />
                    </div>
                </div>

                {/* Product Preview Card */}
                {product && (
                    <div className="bg-white p-6 rounded-sm shadow-md border border-gray-100 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="w-24 h-24 rounded-sm overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ShoppingBag size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-lato text-[var(--dourado-suave)] uppercase tracking-[0.2em] font-bold block mb-1">Você está avaliando:</span>
                            <h3 className="font-playfair text-xl text-[var(--azul-profundo)] truncate">{product.name}</h3>
                            <p className="text-[10px] text-gray-400 font-lato uppercase tracking-widest mt-1">Pedido #{tokenData?.orderId?.substring(0, 8)}</p>
                        </div>
                    </div>
                )}

                {/* Form Container */}
                <div className="bg-white p-10 rounded-sm shadow-2xl border border-gray-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--azul-profundo)] via-[var(--dourado-suave)] to-[var(--azul-profundo)]"></div>
                    <ReviewForm
                        productId={tokenData.productId}
                        token={token}
                        onReviewSubmitted={() => navigate(`/product/${tokenData.productId}`)}
                    />
                </div>

                {/* Footer simple */}
                <div className="text-center">
                    <p className="text-[10px] font-lato text-gray-400 uppercase tracking-[0.3em]">Ateliê Filhos de Aruanda © 2026</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmissionPage;
