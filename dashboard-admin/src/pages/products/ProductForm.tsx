import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import { VariantsManager } from '../../components/products/VariantsManager';
import { MediaGallery } from '../../components/products/MediaGallery';
import { CreatableCategorySelect } from '../../components/products/CreatableCategorySelect';
import { ChevronLeft, Save, Plus, Wand2 } from 'lucide-react';
import type { ProductMedia, ProductVariant } from '../../types/product';
import type { Category } from '../../types/category';
import type { AdminServiceProvider } from '../../types/store-settings';
import { AdminProviderService } from '../../services/AdminProviderService';
import { FiscalService, NcmResponse } from '../../services/FiscalService';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string(),
  category: z.string().min(1, 'Categoria obrigatória'),
  tenantId: z.string(),
  marketplaceIds: z.array(z.string()).optional(),
  weight: z.coerce.number().optional().default(0),
  height: z.coerce.number().optional().default(0),
  width: z.coerce.number().optional().default(0),
  length: z.coerce.number().optional().default(0),
  ncm: z.string().min(1, 'NCM é obrigatório'),
  productionType: z.enum(['PROPRIA', 'REVENDA']).default('REVENDA'),
  origin: z.string().min(1, 'Origem é obrigatória').default('0'),
});

type FormData = z.infer<typeof schema>;

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();

  // Product-level states
  const [categories, setCategories] = useState<Category[]>([]);
  const [marketplaces, setMarketplaces] = useState<AdminServiceProvider[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [allMedia, setAllMedia] = useState<ProductMedia[]>([]);
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmResponse[]>([]);
  const [isSearchingNcm, setIsSearchingNcm] = useState(false);
  const [showNcmResults, setShowNcmResults] = useState(false);

  // Step-by-step Variant states
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [currentMedia, setCurrentMedia] = useState<ProductMedia[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null); // holds the typed name if dynamic
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const [variantInput, setVariantInput] = useState({
    color: '',
    size: '',
    sku: '',
    originalPrice: '',
    price: '',
    stock: ''
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      tenantId: '1',
      weight: 0,
      height: 0,
      width: 0,
      length: 0,
      marketplaceIds: [],
      productionType: 'REVENDA',
      origin: '0',
      ncm: '',
    }
  });

  const CHANNEL_ICONS: Record<string, string> = {
    'mercadolivre': 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.21.3/mercadolibre/favicon.svg',
    'tiktok': 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
    'LOJA_VIRTUAL': '/logo.png'
  };

  useEffect(() => {
    loadCategories();
    loadMarketplaces();
    if (id) {
      loadProduct();
    } else {
      // Limpa TODO o estado ao criar novo produto
      reset({
        title: '',
        description: '',
        category: '',
        tenantId: '1',
        marketplaceIds: [],
      });
      setVariants([]);
      setCurrentMedia([]);
      setAllMedia([]);
      setSelectedMarketplaces([]);
      setEditingVariantId(null);
      setNewCategoryName(null);
      setVariantInput({ color: '', size: '', sku: '', originalPrice: '', price: '', stock: '' });
    }
  }, [id]);

  const loadMarketplaces = async () => {
    try {
      const data = await AdminProviderService.listProviders();
      const dbMarketplaces = data.filter(p => p.serviceType === 'MARKETPLACE' && p.enabled);
      setMarketplaces(dbMarketplaces);

      if (!id) {
        const ecommerce = dbMarketplaces.find(p => p.code === 'LOJA_VIRTUAL');
        if (ecommerce) {
          setSelectedMarketplaces([ecommerce.id]);
        }
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
        category: (product as any).categoryId || product.category || '',
        tenantId: product.tenantId || '1',
        marketplaceIds: product.marketplaceIds || [],
        weight: (product as any).weight || product.dimensions?.weight || 0,
        height: (product as any).height || product.dimensions?.height || 0,
        width: (product as any).width || product.dimensions?.width || 0,
        length: (product as any).length || product.dimensions?.length || 0,
        ncm: (product as any).ncm || '',
        productionType: (product as any).productionType || 'REVENDA',
        origin: (product as any).origin || '0',
      });
      if (product.variants) setVariants(product.variants);
      if (product.media) {
        setAllMedia(product.media);
      }
      if (product.marketplaceIds) setSelectedMarketplaces(product.marketplaceIds);
    } catch (error) {
      console.error('Erro ao carregar produto', error);
    }
  };

  const handleGenerateDescription = async () => {
    const title = getValues('title');
    if (!title) return addToast('Preencha o título do formulário primeiro.', 'info');

    const mainImage = currentMedia.find(m => m.isMain) || currentMedia[0];
    const imageUrl = mainImage ? mainImage.url : undefined;

    // Frontend validation to capture missing image before sending to API 
    // (though the Backend will also validate this as per requirements)
    if (!imageUrl) {
      addToast('É necessário adicionar uma imagem da variante atual para gerar as informações via IA.', 'info');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const productInfo = await ProductService.generateDescription(title, imageUrl);
      if (!productInfo || !productInfo.description) throw new Error('Descrição vazia retornada.');
      setValue('description', productInfo.description);
      if (productInfo.title && productInfo.title !== title) {
        setValue('title', productInfo.title);
      }
    } catch (error: any) {
      console.error('Erro IA:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro desconhecido.';
      if (confirm(`Atenção: ${msg}\n\nVerifique as imagens anexadas ou se a Chave IA é válida nas Configurações.\nDeseja ir para configurações agora?`)) {
        navigate('/settings/ai');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const ncmValue = watch('ncm');
      if (ncmValue && ncmValue.length >= 2 && !showNcmResults && !isSearchingNcm) {
        // Apenas busca se o usuário estiver digitando e não tiver selecionado ainda
        searchNcm(ncmValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [watch('ncm')]);

  const searchNcm = async (query: string) => {
    setIsSearchingNcm(true);
    setShowNcmResults(true);
    try {
      const results = await FiscalService.searchNcms(query);
      setNcmSuggestions(results);
    } catch (error) {
      console.error('Erro ao buscar NCM:', error);
    } finally {
      setIsSearchingNcm(false);
    }
  };

  const handleSelectNcm = (ncm: NcmResponse) => {
    setValue('ncm', ncm.code);
    setShowNcmResults(false);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id!);
    setVariantInput({
      color: variant.attributes?.color || '',
      size: variant.attributes?.size || '',
      sku: variant.sku || '',
      originalPrice: variant.originalPrice?.toString() || '',
      price: variant.price?.toString() || '',
      stock: variant.stock?.toString() || ''
    });

    if (variant.media && variant.media.length > 0) {
      setCurrentMedia(variant.media);
    } else if (variant.imageUrl) {
      const existingMedia = allMedia.find(m => m.url === variant.imageUrl);
      if (existingMedia) {
        setCurrentMedia([{ ...existingMedia, isMain: true }]);
      } else {
        setCurrentMedia([{ id: variant.imageUrl, url: variant.imageUrl, isMain: true, type: 'IMAGE' as any }]);
      }
    } else {
      setCurrentMedia([]);
    }

    // Scroll up to Variant inputs smoothly
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAddVariant = () => {
    // Inheritance logic
    const firstVariant = variants.length > 0 ? variants[0] : null;

    const finalPrice = variantInput.price === ''
      ? (firstVariant ? firstVariant.price : 0)
      : Number(variantInput.price);

    const finalOriginalPrice = variantInput.originalPrice === ''
      ? (firstVariant ? firstVariant.originalPrice : undefined)
      : Number(variantInput.originalPrice) || undefined;

    if (finalOriginalPrice && finalPrice >= finalOriginalPrice) {
      addToast("O Preço promocional deve ser menor ou igual ao Preço Original.", "error");
      return;
    }

    const finalStock = variantInput.stock === ''
      ? (firstVariant ? firstVariant.stock : 0)
      : Number(variantInput.stock);

    const finalColor = variantInput.color.trim() === ''
      ? (firstVariant ? firstVariant.attributes?.color : '')
      : variantInput.color.trim();

    const finalSize = variantInput.size.trim() === ''
      ? (firstVariant ? firstVariant.attributes?.size : '')
      : variantInput.size.trim();

    // Frontend validation for Variant Image (optional by user instructions, but good UX to catch before clicking "Salvar Produto")
    // "O Frontend não deve fazer a validação rígida de imagem no client-side; deve apenas capturar o erro da API"
    // So we allow adding without image to the list. The backend will reject when "Salvar Produto" is hit.

    const mainImage = currentMedia.find(m => m.isMain) || currentMedia[0];

    const variant: ProductVariant = {
      id: editingVariantId || crypto.randomUUID(),
      sku: variantInput.sku.trim(), // SKU is auto-generated by backend if empty
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      stock: finalStock,
      attributes: { size: finalSize || 'Unico', color: finalColor || '' },
      imageUrl: mainImage ? mainImage.url : '',
      media: currentMedia.map(m => ({ ...m }))
    };

    // Store media securely for final payload
    setAllMedia(prev => {
      const newArr = [...prev];
      for (const m of currentMedia) {
        if (!newArr.some(ext => ext.url === m.url)) newArr.push(m);
      }
      return newArr;
    });

    if (editingVariantId) {
      setVariants(prev => prev.map(v => v.id === editingVariantId ? variant : v));
      setEditingVariantId(null);
    } else {
      setVariants(prev => [...prev, variant]);
    }

    // Clear variant inputs and media
    setVariantInput({ color: '', size: '', sku: '', originalPrice: '', price: '', stock: '' });
    setCurrentMedia([]);
  };

  const onCategoryChange = (val: string, newName?: string) => {
    if (val.startsWith('NEW_') && newName) {
      setNewCategoryName(newName);
      setValue('category', val); // Temporary ID
    } else {
      setNewCategoryName(null);
      setValue('category', val);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      let finalCategoryId = data.category;

      // Handle dynamic category creation right before saving the product
      if (finalCategoryId.startsWith('NEW_') && newCategoryName) {
        try {
          const createdCat = await CategoryService.create({ name: newCategoryName, active: true });
          finalCategoryId = createdCat.id;
        } catch (e) {
          console.error("Falha ao criar nova categoria dynamique", e);
          addToast('Erro ao criar a nova categoria. Tente novamente.', 'error');
          setIsSaving(false);
          return;
        }
      }

      // If user forgot to add variant but filled something, alert them or auto add?
      if (variants.length === 0) {
        if (!confirm("Você não adicionou nenhuma variante à lista clicando no botão 'Adicionar'. Deseja salvar um produto sem variantes ou voltar e clicar em Adicionar?")) {
          setIsSaving(false);
          return;
        }
      }

      // Aggregate all media
      const sortedMedia = [...allMedia].sort((a, b) => {
        if (a.isMain) return -1;
        if (b.isMain) return 1;
        return 0;
      });

      // As per backend logic, product base fields takes the first variant if price/stock are 0 
      const basePrice = variants.length > 0 ? variants[0].price : 0;
      const baseOriginalPrice = variants.length > 0 ? variants[0].originalPrice : undefined;
      const baseStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

      const payload: any = {
        ...data,
        category: finalCategoryId,
        price: basePrice,
        originalPrice: baseOriginalPrice,
        stock: baseStock,
        active: true,
        variants,
        media: sortedMedia,
        marketplaceIds: selectedMarketplaces,
        width: data.width,
        length: data.length,
        ncm: data.ncm,
        productionType: data.productionType,
        origin: data.origin,
      };

      if (id) {
        await ProductService.update(id, payload);
      } else {
        await ProductService.create(payload);
      }
      navigate('/products');

    } catch (error: any) {
      console.error('Erro ao salvar produto', error);
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro interno da API';
      addToast(`Erro ao ${id ? 'atualizar' : 'criar'} produto: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
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
          <p className="text-gray-500">Cadastro passo-a-passo de Informações e Variantes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Passo 1 - Mídia & Imagens */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4 text-sm text-indigo-600 bg-indigo-50 p-3 rounded border border-indigo-100 italic">
            Para adicionar um produto com múltiplas variantes e fotos distintas: anexe primeiro as fotos de uma cor/modelo, preencha os dados abaixo e clique em <b>"Adicionar"</b>. A galeria será limpa para você subir as fotos da próxima variação! A foto principal da Categoria se torna a Capa da variante.
          </div>
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Mídia & Imagens da Variante Atual</h2>
          <MediaGallery media={currentMedia} onChange={setCurrentMedia} />
        </div>

        {/* Passo 2 - Informações Básicas & Variantes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Informações Básicas & Variantes</h2>

          {/* Dados Gerais (Retidos após Adicionar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título do Produto</label>
              <input id="title" {...register('title')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Ex: Vestido Amarelo Ogum" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <CreatableCategorySelect
                categories={categories}
                value={watch('category')}
                onChange={onCategoryChange}
                error={errors.category?.message}
              />
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <Button
                  type="button"
                  onClick={handleGenerateDescription}
                  isLoading={isGeneratingAI}
                  variant="secondary"
                  size="sm"
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none"
                  title="Utiliza a imagem principal em anexo acima para gerar detalhes"
                >
                  <Wand2 size={14} /> {isGeneratingAI ? 'Gerando...' : 'Gerar informações por IA'}
                </Button>
              </div>
              <textarea id="description" {...register('description')} className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Descreva os detalhes gerais da peça..." />
            </div>
          </div>

          {/* Dados Específicos da Variante (Limpados após Adicionar) */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
            <div className="col-span-1 border-l-2 border-indigo-200 pl-2">
              <label className="text-xs text-gray-500 mb-1 block">Cor <span className="text-gray-400 italic font-mono">(ex: Ouro)</span></label>
              <input
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.color}
                onChange={e => setVariantInput({ ...variantInput, color: e.target.value })}
                placeholder="Deixe vazio p/ herdar"
              />
            </div>
            <div className="col-span-1 border-l-2 border-indigo-200 pl-2">
              <label className="text-xs text-gray-500 mb-1 block">Tamanho <span className="text-gray-400 italic font-mono">(ex: P)</span></label>
              <input
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.size}
                onChange={e => setVariantInput({ ...variantInput, size: e.target.value })}
                placeholder="Deixe vazio p/ herdar"
              />
            </div>
            <div className="col-span-1 border-l-2 border-amber-200 pl-2">
              <label className="text-xs text-gray-400 mb-1 block line-through">De (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.originalPrice}
                onChange={e => setVariantInput({ ...variantInput, originalPrice: e.target.value })}
                placeholder="Vazio p/ herdar"
              />
            </div>
            <div className="col-span-1 border-l-2 border-amber-500 pl-2">
              <label className="text-xs text-gray-800 font-bold mb-1 block">Por (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.price}
                onChange={e => setVariantInput({ ...variantInput, price: e.target.value })}
                placeholder="0.00 (ou herdar)"
              />
            </div>
            <div className="col-span-1 border-l-2 border-amber-200 pl-2">
              <label className="text-xs text-gray-500 mb-1 block">Qtde. Estoque</label>
              <input
                type="number"
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.stock}
                onChange={e => setVariantInput({ ...variantInput, stock: e.target.value })}
                placeholder="0 (ou herdar)"
              />
            </div>
            <div className="col-span-1 border-l-2 border-gray-200 pl-2">
              <label className="text-xs text-gray-500 mb-1 block">SKU</label>
              <input
                className="w-full p-2 text-sm border rounded bg-white"
                value={variantInput.sku}
                onChange={e => setVariantInput({ ...variantInput, sku: e.target.value })}
                placeholder="Auto"
              />
            </div>

            <div className="col-span-2 md:col-span-5 flex justify-end mt-2 items-center gap-3">
              {editingVariantId && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingVariantId(null);
                    setVariantInput({ color: '', size: '', sku: '', originalPrice: '', price: '', stock: '' });
                    setCurrentMedia([]);
                  }}
                  variant="ghost"
                >
                  Cancelar Edição
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddVariant}
                variant="primary"
              >
                {editingVariantId ? <Save size={18} /> : <Plus size={18} />}
                {editingVariantId ? 'Salvar Alteração' : 'Adicionar Variante'}
              </Button>
            </div>
          </div>

          {/* Componente Puro de Lista */}
          <div className="pt-4 border-t">
            <VariantsManager variants={variants} onChange={setVariants} onEdit={handleEditVariant} />
          </div>

        </div>

        {/* Peso e Dimensões — necessário para cálculo de frete */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Peso e Dimensões</h2>
          <p className="text-sm text-gray-500">Necessário para o cálculo de frete. Informe os valores da embalagem pronta para envio.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (g)</label>
              <input
                type="number"
                step="any"
                {...register('weight', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Ex: 300 ou 0.5"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
              <input
                type="number"
                step="any"
                {...register('height', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Ex: 10"
              />
              {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Largura (cm)</label>
              <input
                type="number"
                step="any"
                {...register('width', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Ex: 20"
              />
              {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (cm)</label>
              <input
                type="number"
                step="any"
                {...register('length', { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Ex: 30"
              />
              {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length.message}</p>}
            </div>
          </div>
        </div>

        {/* Passo 3 - Dados Fiscais (Obrigatórios para NF-e) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Dados Fiscais</h2>
          <p className="text-sm text-gray-500">Informações essenciais para a emissão correta de notas fiscais (NF-e).</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NCM <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('ncm')}
                  placeholder="Busque por código ou nome..."
                  className="w-full p-2 pl-9 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  autoComplete="off"
                  onFocus={() => watch('ncm').length >= 2 && setShowNcmResults(true)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />

                {showNcmResults && (ncmSuggestions.length > 0 || isSearchingNcm) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {isSearchingNcm ? (
                      <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                    ) : (
                      ncmSuggestions.map((ncm) => (
                        <button
                          key={ncm.code}
                          type="button"
                          className="w-full text-left p-3 hover:bg-indigo-50 border-b last:border-0 transition-colors"
                          onClick={() => handleSelectNcm(ncm)}
                        >
                          <div className="font-bold text-indigo-600">{ncm.code}</div>
                          <div className="text-xs text-gray-500 truncate">{ncm.description}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.ncm && <p className="text-red-500 text-xs mt-1">{errors.ncm.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Produção <span className="text-red-500">*</span>
              </label>
              <select
                {...register('productionType')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="REVENDA">Revenda</option>
                <option value="PROPRIA">Própria (Fabricação)</option>
              </select>
              {errors.productionType && <p className="text-red-500 text-xs mt-1">{errors.productionType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origem <span className="text-red-500">*</span>
              </label>
              <select
                {...register('origin')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="0">0 - Nacional</option>
                <option value="1">1 - Estrangeira - Importação direta</option>
                <option value="2">2 - Estrangeira - Adquirida mercado interno</option>
                <option value="3">3 - Nacional (Conteúdo Import. {'>'} 40%)</option>
                <option value="4">4 - Nacional (Conf. Processos Básicos)</option>
                <option value="5">5 - Nacional (Conteúdo Import. {'<='} 40%)</option>
                <option value="6">6 - Estrangeira - (Importação direta s/ similar)</option>
                <option value="7">7 - Estrangeira - (Mercado interno s/ similar)</option>
                <option value="8">8 - Nacional (Conteúdo Import. {'>'} 70%)</option>
              </select>
              {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin.message}</p>}
            </div>
          </div>
        </div>

        {/* Canais de Vendas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">Canais de Venda</h2>
          <div className="space-y-3">
            {marketplaces.length === 0 && <p className="text-sm text-gray-500">Nenhum canal de venda configurado.</p>}
            {marketplaces.map(mp => (
              <label key={mp.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
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
                  className="w-5 h-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500"
                />
                <div className="w-8 h-8 flex items-center justify-center p-1 bg-white rounded-lg border border-gray-100">
                  <img
                    src={CHANNEL_ICONS[mp.code] || '/logo.png'}
                    alt={mp.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">{mp.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Bar / Rodapé */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t p-4 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            type="button"
            onClick={() => navigate('/products')}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 min-w-[160px]"
          >
            {!isSaving && <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </form >
    </div >
  );
}

