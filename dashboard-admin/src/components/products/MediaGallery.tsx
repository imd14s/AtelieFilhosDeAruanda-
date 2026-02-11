import { useState } from 'react';
import { Upload, X, Wand2 } from 'lucide-react';
import { MediaService } from '../../services/MediaService';
import type { ProductMedia } from '../../types/product';

interface MediaGalleryProps {
    media: ProductMedia[];
    onChange: (media: ProductMedia[]) => void;
}

export function MediaGallery({ media, onChange }: MediaGalleryProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setIsUploading(true);
            setUploadProgress(0);
            const newMediaItems: ProductMedia[] = [];

            for (const file of e.target.files) {
                try {
                    const response = await MediaService.upload(file, (progress) => {
                        setUploadProgress(progress);
                    });
                    newMediaItems.push({
                        id: response.id,
                        url: response.url,
                        type: 'IMAGE',
                        isMain: media.length === 0 // Primeira vira capa
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            onChange([...media, ...newMediaItems]);
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeMedia = (id: string) => {
        onChange(media.filter(m => m.id !== id));
    };

    const setMain = (id: string) => {
        onChange(media.map(m => ({ ...m, isMain: m.id === id })));
    };

    const handleMagicRemoveBg = async (id: string) => {
        // Exemplo de integração futura com botão de IA
        const newUrl = await MediaService.removeBackground(id);
        onChange(media.map(m => m.id === id ? { ...m, url: newUrl } : m));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Galeria de Mídia</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Upload Button */}
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                    {isUploading ? (
                        <div className="w-full px-4">
                            <Upload className="text-indigo-600 mb-2 mx-auto" />
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <span className="text-sm text-indigo-600 font-medium">
                                {uploadProgress}%
                            </span>
                        </div>
                    ) : (
                        <>
                            {isUploading ? (
                                <div className="text-center w-full px-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    <span className="text-sm text-gray-400">Processando...</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Adicionar Fotos</span>
                                </>
                            )}
                        </>
                    )}
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
                </label>

                {/* Media List */}
                {media.map(item => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden border h-40">
                        <img src={item.url} className="w-full h-full object-cover" />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                                <button onClick={() => removeMedia(item.id)} className="text-white hover:text-red-400">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMain(item.id)}
                                    className={`text-xs px-2 py-1 rounded ${item.isMain ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                >
                                    {item.isMain ? 'Capa' : 'Definir Capa'}
                                </button>
                                <button
                                    onClick={() => handleMagicRemoveBg(item.id)}
                                    title="Remover Fundo (IA)"
                                    className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700"
                                >
                                    <Wand2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
