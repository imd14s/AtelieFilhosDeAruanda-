import { useState, useEffect } from 'react';
import { Heart, Send, Search, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface FavoriteRanking {
    productId: string;
    name: string;
    mainImage: string;
    price: number;
    favoriteCount: number;
}

export default function ProductFavoritesRanking() {
    const [ranking, setRanking] = useState<FavoriteRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [creatingCampaignFor, setCreatingCampaignFor] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadRanking();
    }, []);

    const loadRanking = async () => {
        setLoading(true);
        try {
            const res = await api.get('/favorites/ranking');
            setRanking(res.data);
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (product: FavoriteRanking) => {
        if (!confirm(`Deseja criar uma campanha de e-mail focada em "${product.name}" para os ${product.favoriteCount} clientes que favoritaram?`)) return;

        setCreatingCampaignFor(product.productId);
        try {
            const newCampaign = {
                name: `Promoção Exclusiva: ${product.name}`,
                subject: `Baixou de preço! O item que você favoritou está em oferta limitadíssima.`,
                content: `<div style="text-align: center;"><h1>Seu Produto Favorito!</h1><p>Você demonstrou interesse em <strong>${product.name}</strong>. Aproveite essa chance única!</p></div>`,
                status: 'PENDING',
                audience: `PRODUCT:${product.productId}`,
                signatureId: null
            };
            await api.post('/marketing/campaigns', newCampaign);
            alert('Campanha Rascunho criada com sucesso! Você será redirecionado para o Hub de Marketing para editá-la e realizar o disparo.');
            navigate('/marketing/email');
        } catch (error) {
            console.error('Erro ao criar campanha', error);
            alert('Erro ao criar a campanha.');
        } finally {
            setCreatingCampaignFor(null);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const cleanBase = apiUrl.replace(/\/api$/, '');
        return `${cleanBase}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const filteredRanking = ranking.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8 pb-20 fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Heart className="text-rose-500 fill-rose-500" size={32} /> Ranking de Favoritos
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Veja quais produtos são os mais desejados pelos clientes e crie campanhas focadas.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:border-indigo-500 bg-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="font-bold tracking-widest uppercase text-[10px]">Carregando ranking...</p>
                </div>
            ) : ranking.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-20 flex flex-col items-center text-center">
                    <Heart size={64} className="text-gray-200 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Favorito Ainda</h3>
                    <p className="text-gray-500 max-w-md">Seus clientes ainda não começaram a favoritar os produtos. Assim que o fizerem, a lista aparecerá aqui.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Pos</th>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">Preço Atual</th>
                                <th className="px-6 py-4 text-center">Corações</th>
                                <th className="px-6 py-4 text-right">Ação de Marketing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {filteredRanking.map((item, idx) => (
                                <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-black text-gray-400">#{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg border bg-white overflow-hidden flex items-center justify-center shrink-0">
                                                {item.mainImage ? (
                                                    <img src={getImageUrl(item.mainImage)} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="text-gray-300" size={20} />
                                                )}
                                            </div>
                                            <p className="font-bold text-gray-800 drop-shadow-sm line-clamp-2">{item.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-600">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full w-fit mx-auto font-black shadow-inner">
                                            <Heart size={14} className="fill-rose-500" />
                                            {item.favoriteCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleCreateCampaign(item)}
                                            disabled={creatingCampaignFor === item.productId}
                                            className={clsx(
                                                "px-4 py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 gap-x-2 w-full md:w-auto ml-auto transition-all",
                                                creatingCampaignFor === item.productId
                                                    ? "bg-indigo-300 text-white cursor-wait"
                                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm"
                                            )}
                                        >
                                            <Send size={14} />
                                            {creatingCampaignFor === item.productId ? 'CRIANDO...' : 'CRIAR CAMPANHA'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
