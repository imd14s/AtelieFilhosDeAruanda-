import { useState } from 'react';
import { Play, Maximize2, X } from 'lucide-react';
import { Review } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

interface UGCGalleryProps {
    reviews: Review[];
}

const UGCGallery: React.FC<UGCGalleryProps> = ({ reviews }) => {
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string, type: 'IMAGE' | 'VIDEO' } | null>(null);

    const allMedia = reviews.flatMap(r => r.media || []).slice(0, 12);

    if (allMedia.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-end border-l-4 border-[#C9A24D] pl-4">
                <div>
                    <h3 className="font-playfair text-xl text-[var(--azul-profundo)] uppercase tracking-widest">O Axé em Close</h3>
                    <p className="font-lato text-[10px] text-gray-400 uppercase tracking-widest">Fotos reais enviadas por nossos clientes</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allMedia.map((media) => (
                    <button
                        key={media.id}
                        onClick={() => setLightboxMedia(media)}
                        className="group relative aspect-square bg-gray-50 overflow-hidden rounded-sm hover:ring-2 hover:ring-[#C9A24D] transition-all"
                    >
                        {media.type === 'VIDEO' ? (
                            <>
                                <video
                                    src={getImageUrl(media.url)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                    <div className="bg-white/90 p-1.5 rounded-full">
                                        <Play size={12} className="text-[var(--azul-profundo)] fill-current ml-0.5" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <img
                                src={getImageUrl(media.url)}
                                alt="Feedback do cliente"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={14} className="text-white drop-shadow-md" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox Minimalista */}
            {lightboxMedia && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12">
                    <button
                        onClick={() => setLightboxMedia(null)}
                        className="absolute top-6 right-6 text-white hover:text-[#C9A24D] transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <div className="max-w-5xl w-full h-full flex items-center justify-center">
                        {lightboxMedia.type === 'VIDEO' ? (
                            <video
                                src={getImageUrl(lightboxMedia.url)}
                                controls
                                autoPlay
                                className="max-h-full max-w-full"
                            />
                        ) : (
                            <img
                                src={getImageUrl(lightboxMedia.url)}
                                alt="Visualização em tela cheia"
                                className="max-h-full max-w-full object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default UGCGallery;
