import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import { VariantsManager } from '../../components/products/VariantsManager';
import { MediaGallery } from '../../components/products/MediaGallery';
import { ChevronLeft, Save } from 'lucide-react';
import type { CreateProductDTO, ProductMedia, ProductVariant } from '../../types/product';

const schema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string(),
  price: z.number().min(0),
  stock: z.number().min(0),
  category: z.string().min(1, 'Categoria obrigatória'),
  tenantId: z.string().default('1'), // Falback
});

type FormData = z.infer<typeof schema>;

export function ProductForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [media, setMedia] = useState<ProductMedia[]>([]);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 0,
      stock: 0,
      tenantId: '1'
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload: CreateProductDTO = {
        ...data,
        active: true,
        variants,
        media
      };

      await ProductService.create(payload);
      navigate('/products');
    } catch (error) {
      console.error('Erro ao salvar produto', error);
      alert('Erro ao criar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Novo Produto</h1>
          <p className="text-gray-500">Cadastro completo com Variantes e Mídia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Informações Básicas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Produto</label>
              <input {...register('title')} className="w-full p-2 border rounded-lg" placeholder="Ex: Camiseta Branca" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea {...register('description')} className="w-full p-2 border rounded-lg h-24" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base (R$)</label>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Total</label>
              <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input {...register('category')} className="w-full p-2 border rounded-lg" placeholder="Ex: Roupas" />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
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
      </form>
    </div>
  );
}
