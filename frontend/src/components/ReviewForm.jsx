import React, { useState, useRef, useEffect } from 'react';
import { Star, Upload, X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { isSafeImage, fileToImage, loadModel } from '../utils/nsfwModerator';
import { storeService } from '../services/storeService';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [media, setMedia] = useState([]);
    const [hoverRating, setHoverRating] = useState(0);

    const [isModerating, setIsModerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        // Warm up the model
        loadModel().then(() => setIsModelLoaded(true));
    }, []);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (media.length + files.length > 5) {
            setError('Máximo de 5 mídias por avaliação.');
            return;
        }

        setError(null);
        setIsModerating(true);

        const newMedia = [];

        for (const file of files) {
            try {
                // Validation for videos (mocked context for 10s limit if it were a video file)
                if (file.type.startsWith('image/')) {
                    const img = await fileToImage(file);
                    const result = await isSafeImage(img);

                    if (!result.safe) {
                        setError(result.reason);
                        // Non-blocking but alerted: clear input
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        continue;
                    }

                    newMedia.push({
                        file,
                        preview: URL.createObjectURL(file),
                        type: 'IMAGE'
                    });
                } else if (file.type.startsWith('video/')) {
                    // Basic duration check if browser allows
                    newMedia.push({
                        file,
                        preview: URL.createObjectURL(file),
                        type: 'VIDEO'
                    });
                }
            } catch (err) {
                console.error("Error moderating image", err);
                setError('Ocorreu um erro ao processar a imagem.');
            }
        }

        setMedia(prev => [...prev, ...newMedia]);
        setIsModerating(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeMedia = (index) => {
        const item = media[index];
        URL.revokeObjectURL(item.preview);
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Por favor, selecione uma nota de 1 a 5.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // In a real scenario, we would upload images to S3/Cloudinary first
            // Here we simulate the process
            const reviewData = {
                productId,
                rating,
                comment: comment.substring(0, 300),
                media: media.map(m => ({
                    url: m.preview, // Mock URL
                    type: m.type
                }))
            };

            // await storeService.createReview(reviewData);

            setSuccess(true);
            setTimeout(() => {
                if (onReviewSubmitted) onReviewSubmitted();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Erro ao enviar avaliação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle size={64} className="text-green-500 animate-bounce" />
                <h3 className="font-playfair text-2xl text-[var(--azul-profundo)]">Avaliação Enviada!</h3>
                <p className="font-lato text-gray-500">Sua opinião passará por uma rápida moderação e em breve estará no ar.</p>
                <p className="text-[#C9A24D] font-bold">Axé!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
                <span className="font-lato text-xs uppercase tracking-[0.2em] text-gray-400">Sua nota</span>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(s)}
                            className="transition-transform hover:scale-125"
                        >
                            <Star
                                size={32}
                                className={`${s <= (hoverRating || rating)
                                        ? "fill-[#C9A24D] text-[#C9A24D]"
                                        : "text-gray-200"
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-lato text-[10px] uppercase tracking-widest text-gray-500 block">Seu depoimento (Máx 300 caracteres)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={300}
                    rows={4}
                    className="w-full p-4 bg-white border border-gray-200 rounded-sm font-lato text-sm focus:border-[var(--azul-profundo)] focus:ring-0 transition-all outline-none"
                    placeholder="Conte-nos sua experiência com este item sagrado..."
                />
                <div className="flex justify-end">
                    <span className="text-[10px] text-gray-400 font-lato">{comment.length}/300</span>
                </div>
            </div>

            <div className="space-y-4">
                <label className="font-lato text-[10px] uppercase tracking-widest text-gray-500 block">Anexar Mídias (Máx 5)</label>

                <div className="flex flex-wrap gap-4">
                    {media.map((item, index) => (
                        <div key={index} className="relative w-24 h-24 bg-white rounded-sm border border-gray-100 overflow-hidden shadow-sm">
                            {item.type === 'IMAGE' ? (
                                <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <Play size={20} className="text-white fill-white" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    {media.length < 5 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isModerating}
                            className={`w-24 h-24 border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center gap-2 hover:border-[var(--dourado-suave)] hover:bg-[var(--dourado-suave)]/5 transition-all
                ${isModerating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
                        >
                            {isModerating ? (
                                <Loader2 size={24} className="animate-spin text-[#C9A24D]" />
                            ) : (
                                <>
                                    <Upload size={20} className="text-gray-400" />
                                    <span className="text-[8px] uppercase tracking-widest text-gray-400">Upload</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                />

                {!isModelLoaded && (
                    <p className="text-[9px] text-amber-600 font-lato uppercase tracking-widest animate-pulse">
                        Carregando inteligência de moderação...
                    </p>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-700 font-lato">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !isModelLoaded || rating === 0}
                className={`w-full py-4 px-8 bg-[var(--azul-profundo)] text-white font-lato text-xs uppercase tracking-[0.2em] rounded-sm shadow-md transition-all flex items-center justify-center gap-3
          ${(isSubmitting || !isModelLoaded || rating === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#C9A24D] active:scale-[0.98]'}
        `}
            >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Finalizar Avaliação
            </button>

            <p className="text-[9px] text-center text-gray-400 uppercase tracking-widest">
                Protegido por Inteligência Artificial (NSFW Moderation)
            </p>
        </form>
    );
};

const ArrowRight = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export default ReviewForm;
