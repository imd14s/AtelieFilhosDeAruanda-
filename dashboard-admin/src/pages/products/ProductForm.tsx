import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../../services/ProductService';
import type { CreateProductDTO } from '../../services/ProductService';
import { FeatureGateModal } from '../../components/ui/FeatureGateModal';
import { 
  ArrowLeft, Save, Loader2, Sparkles, Image as ImageIcon, 
  Wand2, Layers, Trash2, Plus, Upload, X, Camera 
} from 'lucide-react';

// --- SEÇÃO DE VARIAÇÕES (Agora com Imagem e Atributos) ---
const VariantsSection = ({ control, register }: { control: Control<CreateProductDTO>, register: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // Simples handler para "upload" de imagem da variação (apenas visualização local por enquanto)
  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Num cenário real, aqui faríamos upload para S3/Cloudinary
      // Para o MVP, usamos URL local temporária
      const url = URL.createObjectURL(file);
      // Nota: O react-hook-form precisa de setValue para atualizar o campo 'variants[index].image'
      // Como estamos num subcomponente isolado sem acesso ao setValue global, 
      // deixaremos o input visual. A implementação ideal passaria setValue como prop.
      console.log(`Imagem selecionada para variação ${index}:`, url);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Layers size={20} className="text-indigo-600" />
          Variações (SKUs)
        </h3>
        <button type="button" onClick={() => append({ name: '', sku: '', price: 0, stock: 0, image: '', attributes: '' })} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          <Plus size={16} /> Adicionar Variação
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-12 gap-4 items-start">
            
            {/* Imagem da Variação */}
            <div className="col-span-1 flex flex-col items-center justify-center">
               <label className="w-12 h-12 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition overflow-hidden">
                  <Camera size={20} className="text-gray-500" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantImageUpload(index, e)} />
               </label>
               <span className="text-[10px] text-gray-500 mt-1">Foto</span>
            </div>

            {/* Campos de Dados */}
            <div className="col-span-3">
              <label className="text-xs text-gray-500 font-semibold">Nome/Cor</label>
              <input {...register(`variants.${index}.name`)} className="w-full bg-white px-3 py-2 border rounded text-sm" placeholder="Ex: Azul Marinho" />
            </div>

            <div className="col-span-3">
               <label className="text-xs text-gray-500 font-semibold">Atributos/Composição</label>
               <input {...register(`variants.${index}.attributes`)} className="w-full bg-white px-3 py-2 border rounded text-sm" placeholder="Ex: 100% Algodão" />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs text-gray-500 font-semibold">SKU</label>
              <input {...register(`variants.${index}.sku`)} className="w-full bg-white px-3 py-2 border rounded text-sm" placeholder="COD-01" />
            </div>
            
            <div className="col-span-1">
              <label className="text-xs text-gray-500 font-semibold">Preço</label>
              <input type="number" step="0.01" {...register(`variants.${index}.price`)} className="w-full bg-white px-3 py-2 border rounded text-sm" />
            </div>
            
            <div className="col-span-1">
               <label className="text-xs text-gray-500 font-semibold">Qtd</label>
               <input type="number" {...register(`variants.${index}.stock`)} className="w-full bg-white px-3 py-2 border rounded text-sm" />
            </div>

            <div className="col-span-1 flex justify-end pt-6">
              <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {fields.length === 0 && <p className="text-sm text-gray-400 italic text-center p-4">Nenhuma variação adicionada. O produto será considerado único.</p>}
      </div>
    </div>
  );
};

export function ProductForm() {
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateProductDTO>({
    defaultValues: {
      variants: [],
      images: []
    }
  });
  
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Controle do Modal de Feature Gate
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState('');

  // Imagens Locais
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'ai-edit'>('upload');

  const openGate = (feature: string) => {
      setGateFeature(feature);
      setGateOpen(true);
  };

  const onSubmit = async (data: CreateProductDTO) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity),
        images: localImages
      };
      await ProductService.create(payload);
      navigate('/products');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar. Verifique se o Backend está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Modal de Bloqueio de Funcionalidade */}
      <FeatureGateModal 
        isOpen={gateOpen} 
        onClose={() => setGateOpen(false)} 
        featureName={gateFeature} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Novo Produto</h1>
            <p className="text-gray-500">Cadastro de Catálogo</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium shadow-sm"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Publicar Produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Dados Principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input
                {...register('name', { required: 'Nome é obrigatório' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Imagem de São Jorge 30cm"
              />
            </div>

            {/* Descrição com Gate de IA */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                Descrição
              </label>
              <div className="relative">
                <textarea
                  {...register('description')}
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Descreva os detalhes do produto..."
                />
                <button 
                  type="button"
                  onClick={() => openGate('Geração de Texto (GPT-4o)')}
                  className="absolute bottom-3 right-3 flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:shadow-md transition"
                >
                  <Sparkles size={14} />
                  Gerar com IA
                </button>
              </div>
            </div>

            {/* Preço e Estoque Básico */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Base (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Total</label>
                <input
                  type="number"
                  {...register('stockQuantity', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção de Variações V2 */}
          <VariantsSection control={control} register={register} />
        </div>

        {/* COLUNA DIREITA: Imagens e IA Studio */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-indigo-600" />
              Mídia & IA Studio
            </h3>

            {/* Abas */}
            <div className="flex border-b mb-4">
              <button 
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'upload' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              >
                Upload
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('ai-edit')}
                className={`flex-1 pb-2 text-sm font-medium ${activeTab === 'ai-edit' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
              >
                Edição IA
              </button>
            </div>

            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Arraste fotos do produto</p>
                  <input type="file" className="hidden" multiple onChange={(e) => {
                      if (e.target.files) {
                          const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
                          setLocalImages([...localImages, ...newImages]);
                      }
                  }} />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {localImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setLocalImages(localImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Edição IA (Com Gate) */}
            {activeTab === 'ai-edit' && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                    <Wand2 size={16} /> Ferramentas Mágicas
                  </h4>
                  
                  <div className="space-y-3">
                    <button 
                        type="button" 
                        onClick={() => openGate('Remoção de Fundo (Background Removal)')}
                        className="w-full bg-white border border-purple-200 text-purple-700 py-2 rounded text-sm hover:bg-purple-100 transition flex justify-between px-4"
                    >
                      Remover Fundo <span>✂️</span>
                    </button>
                    
                    <div>
                        <label className="text-xs text-purple-700 font-semibold mb-1 block">Juntar Fotos / Compor</label>
                        <div className="relative">
                            <textarea 
                                placeholder="Descreva como quer unir as fotos..."
                                className="w-full text-xs p-2 border border-purple-200 rounded mb-2 h-20"
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => openGate('Composição de Imagens (Stable Diffusion)')}
                            className="w-full bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700 transition"
                        >
                            Gerar Composição (Merge)
                        </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">Requer n8n conectado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
