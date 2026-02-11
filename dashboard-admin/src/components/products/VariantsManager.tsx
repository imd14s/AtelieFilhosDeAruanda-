import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ProductVariant } from '../../types/product';

interface VariantsManagerProps {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
}

export function VariantsManager({ variants, onChange }: VariantsManagerProps) {
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
        sku: '',
        price: 0,
        stock: 0,
        attributes: { size: '', color: '' }
    });

    const handleAdd = () => {
        if (!newVariant.sku) return;

        const variant: ProductVariant = {
            id: crypto.randomUUID(),
            sku: newVariant.sku!,
            price: newVariant.price || 0,
            stock: newVariant.stock || 0,
            attributes: { ...newVariant.attributes },
        };

        onChange([...variants, variant]);
        setNewVariant({ sku: '', price: 0, stock: 0, attributes: { size: '', color: '' } });
    };

    const removeVariant = (id: string) => {
        onChange(variants.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Variantes do Produto</h3>

            {/* Form de Adição Rápida */}
            <div className="grid grid-cols-5 gap-2 items-end">
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
                    className="bg-indigo-600 text-white p-2 rounded flex items-center justify-center hover:bg-indigo-700"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Lista de Variantes */}
            <div className="bg-white rounded border divide-y">
                {variants.map(variant => (
                    <div key={variant.id} className="p-3 flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                            <span className="font-mono bg-gray-100 px-2 rounded">{variant.sku}</span>
                            <span className="text-gray-600">
                                {variant.attributes.size} / {variant.attributes.color}
                            </span>
                            <span className="font-medium">R$ {variant.price.toFixed(2)}</span>
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
