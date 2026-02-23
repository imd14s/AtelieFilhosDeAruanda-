import { useState, useRef } from 'react';
import { Upload, X, Wand2 } from 'lucide-react';
import { ComingSoonModal } from '../ui/ComingSoonModal';
import type { ProductMedia } from '../../types/product';
import { getImageUrl } from '../../utils/imageUtils';

interface MediaGalleryProps {
    media: ProductMedia[];
    onChange: (media: ProductMedia[]) => void;
}

export function MediaGallery({ media, onChange }: MediaGalleryProps) {
    const [showComingSoon, setShowComingSoon] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newMediaItems: ProductMedia[] = [];

            for (const file of e.target.files) {
                const isVideo = file.type.startsWith('video/');
                const localUrl = URL.createObjectURL(file);

                newMediaItems.push({
                    id: crypto.randomUUID(),
                    url: localUrl,
                    type: isVideo ? 'VIDEO' : 'IMAGE',
                    isMain: media.length === 0 && !isVideo,
                    file: file
                } as any);
            }

            if (newMediaItems.length > 0) {
                onChange([...media, ...newMediaItems]);
            }

            // Resetar o valor do input para permitir selecionar o mesmo arquivo novamente
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeMedia = (id: string) => {
        onChange(media.filter(m => m.id !== id));
    };

    const setMain = (id: string) => {
        onChange(media.map(m => ({ ...m, isMain: m.id === id })));
    };

    const handleMagicRemoveBg = async (_id: string) => {
        setShowComingSoon(true);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Galeria de Mídia</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Upload Button */}
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition relative">
                    <div className="text-center w-full px-4">
                        <Upload className="text-gray-400 mb-2 mx-auto" />
                        <span className="text-sm text-gray-500 block">Upload Arquivo</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleUpload}
                    />
                </label>


                {/* Media List */}
                {media.map(item => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden border h-40 bg-gray-100">
                        {item.type === 'VIDEO' || (item.url && (item.url.endsWith('.mp4') || item.url.endsWith('.webm'))) ? (
                            <video
                                src={getImageUrl(item.url)}
                                className="w-full h-full object-cover"
                                controls
                            />
                        ) : (
                            <img
                                src={getImageUrl(item.url)}
                                alt="Media Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Erro+Imagem';
                                }}
                            />
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none group-hover:pointer-events-auto">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => removeMedia(item.id)} className="text-white hover:text-red-400 z-10">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {item.type === 'IMAGE' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setMain(item.id)}
                                            className={`text-xs px-2 py-1 rounded ${item.isMain ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                        >
                                            {item.isMain ? 'Capa' : 'Definir Capa'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMagicRemoveBg(item.id)}
                                            title="Remover Fundo (IA)"
                                            className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700"
                                        >
                                            <Wand2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ComingSoonModal
                isOpen={showComingSoon}
                onClose={() => setShowComingSoon(false)}
                title="Remoção de Fundo com IA"
                message="Essa funcionalidade será liberada em uma atualização futura. Em breve você poderá remover o fundo das suas imagens com apenas um clique!"
            />
        </div>
    );
}
