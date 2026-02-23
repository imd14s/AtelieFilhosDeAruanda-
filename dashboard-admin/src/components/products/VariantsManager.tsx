import { Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import type { ProductVariant } from '../../types/product';
import { getImageUrl } from '../../utils/imageUtils';

interface VariantsManagerProps {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
    onEdit?: (variant: ProductVariant) => void;
}

export function VariantsManager({ variants, onChange, onEdit }: VariantsManagerProps) {
    const removeVariant = (id: string) => {
        onChange(variants.filter(v => v.id !== id));
    };

    if (variants.length === 0) {
        return <div className="p-6 text-center text-gray-400 text-sm border rounded bg-gray-50 border-dashed">Nenhuma variante adicionada ainda. Preencha os dados acima e clique em "Adicionar".</div>;
    }

    return (
        <div className="bg-white rounded border divide-y shadow-sm">
            {variants.map((variant, index) => (
                <div key={variant.id || index} className="p-3 flex items-center justify-between text-sm">
                    <div className="flex gap-4 items-center flex-wrap">
                        {variant.imageUrl ? (
                            <div className="relative">
                                <img src={getImageUrl(variant.imageUrl)} alt="Variant" className="w-10 h-10 rounded object-cover border" />
                                {variant.media && variant.media.length > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                                        {variant.media.length}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center border text-gray-400">
                                <ImageIcon size={16} />
                            </div>
                        )}
                        <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-1 flex items-center rounded text-xs">
                            {variant.sku || 'SKU Auto-gerado'}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">
                                {[variant.attributes?.size, variant.attributes?.color].filter(Boolean).join(' - ') || 'Sem atributos'}
                            </span>
                            <span className="text-gray-500 text-xs">
                                {variant.stock} unidades
                            </span>
                        </div>
                        <div className="flex flex-col ml-auto text-right">
                            {variant.originalPrice && variant.originalPrice > variant.price && (
                                <span className="text-gray-400 text-xs line-through">
                                    R$ {variant.originalPrice.toFixed(2)}
                                </span>
                            )}
                            <span className="font-medium text-emerald-600 block">
                                R$ {(variant.price || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1 ml-4 py-1">
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(variant)}
                                className="text-indigo-500 hover:bg-indigo-50 p-2 rounded transition-colors"
                                title="Editar variante"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => removeVariant(variant.id!)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Remover variante"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
