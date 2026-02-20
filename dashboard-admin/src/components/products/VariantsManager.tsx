import { useState } from 'react';
import { Plus, Trash2, Upload, CloudLightning, Loader2, Image as ImageIcon } from 'lucide-react';
import type { ProductVariant } from '../../types/product';
import { MediaService } from '../../services/MediaService';

interface VariantsManagerProps {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
}

export function VariantsManager({ variants, onChange }: VariantsManagerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        sku: '',
        price: 0,
        stock: 0,
        attributes: { size: '', color: '' },
        imageUrl: ''
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const response = await MediaService.upload(e.target.files[0], () => { });
                setNewVariant(prev => ({ ...prev, imageUrl: response.url }));
            } catch (error) {
                console.error('Upload failed', error);
                alert('Erro ao fazer upload da imagem da variante.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleAdd = () => {
        // SKU is no longer mandatory here, backend will generate it

        const variant: ProductVariant = {
            id: crypto.randomUUID(),
            sku: newVariant.sku!,
            price: newVariant.price || 0,
            stock: newVariant.stock || 0,
            attributes: { ...newVariant.attributes },
            imageUrl: newVariant.imageUrl
        };

        onChange([...variants, variant]);
        setNewVariant({ sku: '', price: 0, stock: 0, attributes: { size: '', color: '' }, imageUrl: '' });
    };

    const removeVariant = (id: string) => {
        onChange(variants.filter(v => v.id !== id));
    };

    const getImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const cleanBase = apiUrl.replace(/\/api$/, '');
        return `${cleanBase}${url}`;
    };

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Variantes do Produto</h3>

            {/* Form de Adição Rápida */}
            <div className="grid grid-cols-6 gap-2 items-end">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Imagem</label>
                    <label className={`border border-dashed border-gray-300 rounded h-[38px] w-full flex items-center justify-center cursor-pointer hover:bg-gray-100 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {newVariant.imageUrl ? (
                            <img src={getImageUrl(newVariant.imageUrl)} alt="Preview" className="h-full w-full object-cover rounded" />
                        ) : (
                            isUploading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Upload size={16} className="text-gray-400" />
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                    </label>
                </div>
                <div>
                    <label className="text-xs text-gray-500">SKU</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={newVariant.sku}
                        onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                        placeholder="SKU-123"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Tamanho</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={newVariant.attributes?.size}
                        onChange={e => setNewVariant({
                            ...newVariant,
                            attributes: { ...newVariant.attributes, size: e.target.value }
                        })}
                        placeholder="P, M, G"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Cor</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={newVariant.attributes?.color}
                        onChange={e => setNewVariant({
                            ...newVariant,
                            attributes: { ...newVariant.attributes, color: e.target.value }
                        })}
                        placeholder="Azul"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Preço</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={newVariant.price || ''}
                        onChange={e => setNewVariant({ ...newVariant, price: e.target.value ? Number(e.target.value) : 0 })}
                        placeholder="0.00"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white p-2 h-10 w-full rounded flex items-center justify-center hover:bg-indigo-700"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Lista de Variantes */}
            <div className="bg-white rounded border divide-y">
                {variants.map(variant => (
                    <div key={variant.id} className="p-3 flex items-center justify-between text-sm">
                        <div className="flex gap-4 items-center">
                            {variant.imageUrl ? (
                                <img src={getImageUrl(variant.imageUrl)} alt="Variant" className="w-8 h-8 rounded object-cover border" />
                            ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border text-gray-400">
                                    <ImageIcon size={14} />
                                </div>
                            )}
                            <span className="font-mono bg-gray-100 px-2 rounded">
                                {variant.sku || 'SKU Auto-gerado'}
                            </span>
                            <span className="text-gray-600">
                                {[variant.attributes?.size, variant.attributes?.color].filter(Boolean).join(' / ') || 'Sem atributos'}
                            </span>
                            <span className="font-medium">
                                {variant.price > 0 ? `R$ ${variant.price.toFixed(2)}` : 'Preço Base'}
                            </span>
                        </div>
                        <button
                            onClick={() => removeVariant(variant.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {variants.length === 0 && (
                    <div className="p-4 text-center text-gray-400 text-sm">Nenhuma variante adicionada</div>
                )}
            </div>
        </div>
    );
}
