import React from 'react';
import { Clock, EyeOff, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const MOCK_HISTORY = [
    {
        id: 1,
        title: 'Kit Energia Firmeza de Exu',
        price: 89.90,
        originalPrice: 120.00,
        discount: 25,
        rating: 4.8,
        reviews: 124,
        image: '/images/default.png',
        installments: { count: 12, value: 8.99 },
        shipping: { type: 'free_shipping' }
    },
    {
        id: 2,
        title: 'Velas Palito Branca 100% Parafina - Caixa 50 Un.',
        price: 45.00,
        rating: 4.5,
        reviews: 89,
        image: '/images/default.png',
        installments: { count: 3, value: 15.00 }
    },
    {
        id: 3,
        title: 'Imagem Zé Pelintra Resina 20cm Premium',
        price: 150.00,
        rating: 5.0,
        reviews: 42,
        image: '/images/default.png',
        installments: { count: 12, value: 15.00 },
        shipping: { type: 'free_shipping' }
    },
    {
        id: 4,
        title: 'Incenso Nag Champa Agarbathi - 15g',
        price: 12.50,
        rating: 4.9,
        reviews: 350,
        image: '/images/default.png',
    }
];

const HistoryPage = () => {
    const { user } = useOutletContext();

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

                    <button className="text-sm text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2">
                        <Trash2 size={16} /> Limpar histórico
                    </button>
                </div>

                {/* Grid de Produtos */}
                {MOCK_HISTORY.length === 0 ? (
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
                            Vistos hoje
                        </div>

                        {/* 
                            Utilizando o componente ProductCard existente para manter 
                            a consistência visual do resto no site.
                        */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 -m-4 bg-gray-50/50 rounded-lg">
                            {MOCK_HISTORY.map((product) => (
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
