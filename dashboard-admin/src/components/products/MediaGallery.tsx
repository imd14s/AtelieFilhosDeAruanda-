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
                    const isVideo = file.type.startsWith('video/');
                    // Backend now returns { id: "...", url: "..." }
                    const response = await MediaService.upload(file, (progress) => {
                        setUploadProgress(progress);
                    });

                    newMediaItems.push({
                        id: response.id,
                        url: response.url, // Use the URL returned by backend
                        type: isVideo ? 'VIDEO' : 'IMAGE',
                        isMain: media.length === 0 && !isVideo // Primeira imagem vira capa (vídeo não)
                    });
                } catch (err) {
                    console.error("Upload failed", err);
                    alert("Erro ao fazer upload da mídia."); // Feedback pro usuário
                }
            }

            if (newMediaItems.length > 0) {
                onChange([...media, ...newMediaItems]);
            }
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

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Remove /api sufixo base se existir para evitar duplicação ou monta corretamente
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const cleanBase = apiUrl.replace(/\/api$/, '');
        return `${cleanBase}${url}`;
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Galeria de Mídia</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Upload Button */}
                <label className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition relative ${isUploading ? 'pointer-events-none bg-gray-50' : ''}`}>
                    {isUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                            <span className="text-xs font-semibold text-indigo-600">Enviando {uploadProgress}%</span>
                        </div>
                    ) : (
                        <div className="text-center w-full px-4">
                            <Upload className="text-gray-400 mb-2 mx-auto" />
                            <span className="text-sm text-gray-500 block">Upload Arquivo</span>
                        </div>
                    )}
                    <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={isUploading} />
                </label>


                {/* Media List */}
                {media.map(item => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden border h-40 bg-gray-100">
                        {item.type === 'VIDEO' || item.url.endsWith('.mp4') || item.url.endsWith('.webm') ? (
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
                                <button onClick={() => removeMedia(item.id)} className="text-white hover:text-red-400 z-10">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {item.type === 'IMAGE' && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
