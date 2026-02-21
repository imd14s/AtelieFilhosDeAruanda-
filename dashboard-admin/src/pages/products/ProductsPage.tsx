import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import type { Product } from '../../types/product';
import { Package, Plus, Search, Edit, Trash2, Bell } from 'lucide-react';
import { StockAlertService, type StockAlertSettings } from '../../services/StockAlertService';
import { calculatePriority, STOCK_COLORS, type ColorPreset } from '../../hooks/useStockAlerts';
import clsx from 'clsx';

export function ProductsPage() {
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const cleanBase = apiUrl.replace(/\/api$/, '');
    return `${cleanBase}${url}`;
  };
  // Inicializa com array vazio para evitar erro no primeiro render
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSort, setStockSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low'>('all');
  const [alertSettings, setAlertSettings] = useState<StockAlertSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        ProductService.getAll(),
        StockAlertService.getSettings()
      ]);

      setAlertSettings(settings);

      // BLINDAGEM: Verifica se é realmente um array antes de setar
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API retornou formato inválido (esperado array):', data);
        setProducts([]); // Fallback para lista vazia
      }
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
      setProducts([]); // Fallback em caso de erro de rede
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (id: string) => {
    // Update otimista: altera o estado local imediatamente
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, alertEnabled: !p.alertEnabled } : p
    ));

    try {
      await ProductService.toggleAlert(id);
      // Não recarregamos a lista para evitar mudança de ordenação e flicker
    } catch (error: any) {
      // Reverte o estado em caso de erro
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, alertEnabled: !p.alertEnabled } : p
      ));

      console.error('Erro ao atualizar alerta', error);
      if (error.response?.status === 404) {
        alert('Produto não encontrado ou funcionalidade indisponível.');
      } else {
        alert('Erro ao atualizar alerta. Tente novamente.');
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;
    try {
      await ProductService.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto', error);
      alert('Erro ao excluir produto. Verifique o console.');
    }
  };

  // Garante que products é um array antes de filtrar
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts
    .filter(p => {
      const matchesSearch = p.title ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesStockFilter =
        stockFilter === 'all' ? true :
          stockFilter === 'out' ? (p.stock <= 0) :
            stockFilter === 'low' ? (p.stock > 0 && p.stock <= (alertSettings?.threshold || 10)) : true;

      return matchesSearch && matchesStockFilter;
    })
    .sort((a, b) => {
      if (stockSort === 'asc') return (a.stock || 0) - (b.stock || 0);
      if (stockSort === 'desc') return (b.stock || 0) - (a.stock || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-gray-500">Gerencie o catálogo da loja</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-gray-700 font-medium"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
          >
            <option value="all">📦 Todos os Estoques</option>
            <option value="out">🚫 Sem Estoque</option>
            <option value="low">⚠️ Estoque Baixo (&lt;10)</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-gray-700 font-medium"
            value={stockSort}
            onChange={(e) => setStockSort(e.target.value as any)}
          >
            <option value="none">⇅ Ordenação Padrão</option>
            <option value="asc">📉 Estoque: Menor primeiro</option>
            <option value="desc">📈 Estoque: Maior primeiro</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando catálogo...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Produto</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Preço</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Estoque</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100 flex-shrink-0">
                          {(() => {
                            const mainImg = product.media?.find(m => m.isMain)?.url || product.media?.[0]?.url;
                            const variantImg = product.variants?.[0]?.imageUrl || product.variants?.[0]?.media?.[0]?.url;
                            // Product can also have a flat array of string in some old legacy endpoints, but usually it's product.images that we parse. Let's try raw image matching too just in case.
                            // @ts-ignore
                            const rawImg = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
                            const finalImg = mainImg || variantImg || rawImg;

                            return finalImg ? (
                              <img
                                src={getImageUrl(finalImg)}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-200');
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></svg>';
                                }}
                              />
                            ) : (
                              <Package size={20} />
                            );
                          })()}
                        </div>
                        <div className="overflow-hidden">
                          <p
                            className="font-medium text-gray-800 truncate"
                            style={{ maxWidth: '250px' }}
                            title={product.title}
                          >
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[250px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {product.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) : 'R$ 0,00'}
                    </td>
                    <td className="p-4">
                      {product.stock <= 0 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 uppercase border border-gray-200">
                          Sem Estoque
                        </span>
                      ) : (() => {
                        const priority = calculatePriority(product.stock || 0, alertSettings);
                        const preset = priority ? STOCK_COLORS[priority.color as ColorPreset] : null;

                        return (
                          <span className={clsx(
                            "px-2 py-1 rounded-full text-xs font-bold transition-all",
                            preset ? clsx(preset.bg, preset.text, product.alertEnabled && "animate-pulse") : "bg-green-100 text-green-700"
                          )}>
                            {product.stock || 0} un
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleAlert(product.id)}
                        className={`transition ${product.alertEnabled ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-500'}`}
                        title={product.alertEnabled ? "Alerta de Estoque Ativo" : "Ativar Alerta de Estoque"}
                      >
                        <Bell size={18} fill={product.alertEnabled ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="text-gray-400 hover:text-indigo-600 transition"
                        title="Editar Produto"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Excluir Produto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
