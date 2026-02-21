import React, { useState } from 'react';
import { Search, Heart, HeartOff, MoreVertical } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const MOCK_FAVORITES = [
    {
        id: 10,
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
        id: 11,
        title: 'Pelúcia Sansão Turma Da Mônical Azul 49cm Antialérgico',
        price: 85.00,
        rating: 4.9,
        reviews: 210,
        image: '/images/default.png',
        installments: { count: 12, value: 8.50 },
        shipping: { type: 'free_shipping' }
    },
    {
        id: 12,
        title: 'Kit Chimarrão Mate Gaúcho Bomba, Cuia Porongo',
        price: 150.00,
        rating: 4.7,
        reviews: 45,
        image: '/images/default.png',
        installments: { count: 12, value: 15.00 }
    }
];

const FavoritesPage = () => {
    const { user } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'lists'

    if (!user) return null;

    const filteredFavorites = MOCK_FAVORITES.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Favoritos" description="Seus produtos e listas favoritos do Ateliê." />

            <div className="max-w-6xl mx-auto px-4 pt-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 font-playfair">Favoritos</h1>

                {/* Tabs de Favoritos e Listas */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'favorites'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Favoritos
                    </button>
                    <button
                        onClick={() => setActiveTab('lists')}
                        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'lists'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Listas
                    </button>
                </div>

                {activeTab === 'favorites' && (
                    <>
                        {/* Filtros e Busca */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="relative w-full md:w-1/2 lg:w-1/3">
                                <input
                                    type="text"
                                    placeholder="Buscar em Favoritos"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>

                            <div className="text-sm text-blue-500 font-semibold cursor-pointer hover:text-blue-600 transition-colors">
                                Mais recentes
                            </div>
                        </div>

                        {/* Grade de Favoritos */}
                        {filteredFavorites.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-md border border-gray-200 shadow-sm mt-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartOff className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum favorito encontrado</h3>
                                <p className="text-gray-500 text-sm mb-6">Explore a loja e adicione produtos aos seus favoritos clicando no coraçãozinho.</p>
                                <Link to="/store" className="bg-blue-500 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors">
                                    Explorar a loja
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-lg">
                                    {filteredFavorites.map((product) => (
                                        <div key={product.id} className="relative group">
                                            {/* Coração de Favorito Pré-selecionado no topo do ProductCard para UX idêntico ao ML */}
                                            <button className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-blue-500 hover:text-red-500 hover:bg-gray-50 transition-colors">
                                                <Heart size={16} className="fill-current" />
                                            </button>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'lists' && (
                    <div className="text-center py-20 bg-white rounded-md border border-gray-200 shadow-sm mt-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MoreVertical className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Crie listas para organizar seus favoritos</h3>
                        <p className="text-gray-500 text-sm mb-6">Em breve você poderá criar listas temáticas, por exemplo: "Presentes de Natal", "Decoração do Terreiro", etc.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
