import React, { useState, useEffect } from 'react';
import { Clock, EyeOff, Trash2, Search, History, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { storeService } from '../services/storeService';

// MOCK_HISTORY removed

const HistoryPage = () => {
    const { user } = useOutletContext();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user?.id) {
                setLoading(true);
                const data = await storeService.history.get(user.id);
                setHistory(data);
                setLoading(false);
            } else {
                setHistory([]); // Clear history if no user or user.id
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const handleClearHistory = async () => {
        if (user?.id && window.confirm("Deseja limpar todo o seu histórico de navegação?")) {
            await storeService.history.clear(user.id);
            setHistory([]);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Meus Favoritos e Histórico" description="Seu histórico de produtos visitados recentemente." />

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 font-playfair">Histórico</h1>
                        <p className="text-gray-500 text-sm mt-1">Produtos que você viu recentemente</p>
                    </div>

                    <button
                        onClick={handleClearHistory}
                        className="text-sm text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Limpar histórico
                    </button>
                </div>

                {/* Grid de Produtos */}
                {history.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-md border border-gray-200 shadow-sm mt-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <EyeOff className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sem histórico por enquanto</h3>
                        <p className="text-gray-500 text-sm mb-6">Comece a navegar na loja para salvar os produtos que você viu.</p>
                        <Link to="/store" className="bg-blue-500 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors">
                            Explorar a loja
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 text-sm text-gray-800 font-bold">
                            <Clock size={18} className="text-gray-400" />
                            Vistos recentemente
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 -m-4 bg-gray-50/50 rounded-lg">
                            {history.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
