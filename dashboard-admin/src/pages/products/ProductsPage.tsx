import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import type { Product } from '../../types/product';
import { Package, Plus, Search, Edit, Trash2, Bell } from 'lucide-react';

export function ProductsPage() {
  // Inicializa com array vazio para evitar erro no primeiro render
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll();

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
    try {
      await ProductService.toggleAlert(id);
      // O ideal seria atualizar apenas o item no estado, mas por simplicidade recarregamos
      // await loadProducts(); 
      // Ou melhor, feedback visual
      alert('Alerta de estoque atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar alerta', error);
      alert('Erro ao atualizar alerta');
    }
  };

  // Garante que products é um array antes de filtrar
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts.filter(p =>
    p.title ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
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
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {product.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) : 'R$ 0,00'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${(product.stock || 0) < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {product.stock || 0} un
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleAlert(product.id)}
                        className="text-gray-400 hover:text-yellow-600 transition"
                        title="Alternar Alerta de Estoque"
                      >
                        <Bell size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-indigo-600 transition">
                        <Edit size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 transition">
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
