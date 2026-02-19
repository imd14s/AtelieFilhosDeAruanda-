import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import { VariantsManager } from '../../components/products/VariantsManager';
import { MediaGallery } from '../../components/products/MediaGallery';
import { ChevronLeft, Save, Plus, Wand2 } from 'lucide-react';
import type { CreateProductDTO, ProductMedia, ProductVariant } from '../../types/product';
import type { Category } from '../../types/category';
import type { AdminServiceProvider } from '../../types/store-settings';
import { AdminProviderService } from '../../services/AdminProviderService';


const schema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string(),
  price: z.number().min(0, 'Preço deve ser positivo'),
  stock: z.number().min(0, 'Estoque deve ser positivo'),
  category: z.string().min(1, 'Categoria obrigatória'),

  tenantId: z.string(),
  marketplaceIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [marketplaces, setMarketplaces] = useState<AdminServiceProvider[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: '1'
    }
  });

  useEffect(() => {
    loadCategories();
    loadMarketplaces();
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadMarketplaces = async () => {
    try {
      const data = await AdminProviderService.listProviders();
      const dbMarketplaces = data.filter(p => p.serviceType === 'MARKETPLACE' && p.enabled);

      const internalStore: AdminServiceProvider = {
        id: 'store-site', // ID fixo para a Loja Virtual
        serviceType: 'MARKETPLACE',
        code: 'LOJA_VIRTUAL',
        name: 'Loja Virtual (Site)',
        enabled: true,
        priority: 0,
        healthEnabled: true
      };

      setMarketplaces([internalStore, ...dbMarketplaces]);

      // Se for novo produto, já vem marcado a Loja Virtual
      if (!id) {
        setSelectedMarketplaces(prev => [...prev, 'store-site']);
      }
    } catch (error) {
      console.error('Erro ao carregar marketplaces', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProduct = async () => {
    if (!id) return;
    try {
      const product = await ProductService.getById(id);
      reset({
        title: product.title || (product as any).name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock !== undefined ? product.stock : (product as any).stockQuantity || 0,
        category: (product as any).categoryId || product.category || '',
        tenantId: product.tenantId || '1',
        marketplaceIds: product.marketplaceIds || []
      });
      if (product.variants) setVariants(product.variants);
      if (product.media) setMedia(product.media);

      // Ensure store-site is selected if it was saved (or legacy products might need migration, 
      // but for now we assume if it's in marketplaceIds it's selected)
      // If product has no marketplaceIds (legacy), maybe default to store-site? 
      // User didn't specify, but usually yes.
      if (product.marketplaceIds && product.marketplaceIds.length > 0) {
        setSelectedMarketplaces(product.marketplaceIds);
      } else {
        // Default for existing products without config? safely add store-site?
        // Let's stick to what's in DB. If empty, it's empty.
        setSelectedMarketplaces([]);
      }
    } catch (error) {
      console.error('Error loading product', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const newCategory = await CategoryService.create({ name: newCategoryName, active: true });
      setCategories(prev => [...prev, newCategory]);
      setShowCategoryModal(false);
      setNewCategoryName('');
      setValue('category', newCategory.id);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Não foi possível criar a categoria. Verifique se já existe ou tente novamente.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleGenerateDescription = async () => {
    const title = getValues('title');
    if (!title) return alert('Preencha o título do produto primeiro.');

    setIsGeneratingAI(true);
    try {
      const description = await ProductService.generateDescription(title);
      if (!description) throw new Error('Descrição vazia retornada.');
      setValue('description', description);
    } catch (error: any) {
      console.error('Erro IA:', error);
      // Improve error message visibility
      // If backend returns 400 or 500 with message "OpenAI Key not configured"
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido.';

      if (confirm(`Erro ao gerar descrição: ${msg}\n\nVerifique se o Token OpenAI está configurado em Configurações.\nDeseja ir para configurações agora?`)) {
        navigate('/configs');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload: CreateProductDTO = {
        ...data,
        active: true,
        variants,

        media,
        marketplaceIds: selectedMarketplaces
      };

      if (id) {
        await ProductService.update(id, payload);
      } else {
        await ProductService.create(payload);
      }
      navigate('/products');
    } catch (error) {
      console.error('Erro ao salvar produto', error);
      alert(`Erro ao ${id ? 'atualizar' : 'criar'} produto`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
          <p className="text-gray-500">Cadastro completo com Variantes e Mídia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Informações Básicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título do Produto</label>
              <input id="title" {...register('title')} className="w-full p-2 border rounded-lg" placeholder="Ex: Camiseta Branca" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingAI}
                  className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1 disabled:opacity-50"
                >
                  <Wand2 size={12} /> {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
                </button>
              </div>
              <textarea id="description" {...register('description')} className="w-full p-2 border rounded-lg h-24" placeholder="Descreva os detalhes do produto..." />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço Base (R$)</label>
              <input id="price" type="number" step="0.01" placeholder="0.00" {...register('price', { valueAsNumber: true })} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Estoque Total</label>
              <input id="stock" type="number" placeholder="0" {...register('stock', { valueAsNumber: true })} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <div className="flex gap-2">
                <select
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  id="category"
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                  title="Criar nova categoria"
                >
                  <Plus size={16} />
                  Nova
                </button>
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
        </div>


        {/* Marketplaces */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Canais de Venda</h2>
          <div className="space-y-3">
            {marketplaces.length === 0 && <p className="text-sm text-gray-500">Nenhum canal de venda configurado.</p>}
            {marketplaces.map(mp => (
              <label key={mp.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMarketplaces.includes(mp.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedMarketplaces(prev => [...prev, mp.id]);
                    } else {
                      setSelectedMarketplaces(prev => prev.filter(id => id !== mp.id));
                    }
                  }}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="font-medium text-gray-900">{mp.name}</span>
                  <p className="text-xs text-gray-500">{mp.code}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Gerenciamento de Mídia */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Mídia & Imagens</h2>
          <MediaGallery media={media} onChange={setMedia} />
        </div>

        {/* Variantes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Variantes</h2>
          <VariantsManager variants={variants} onChange={setVariants} />
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t p-4 flex justify-end gap-3 z-10">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form >

      {/* Modal de Criação de Categoria */}
      {
        showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Nova Categoria</h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full p-2 border rounded-lg mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreatingCategory ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
