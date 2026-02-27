import { SafeAny } from '../types/safeAny';

let modelPromise: Promise<SafeAny> | null = null;

/**
 * Loads the NSFW model once using dynamic imports to optimize bundle size.
 */
export const loadModel = async (): Promise<SafeAny> => {
    if (!modelPromise) {
        modelPromise = (async () => {
            const [tf, nsfwjs] = await Promise.all([
                import('@tensorflow/tfjs'),
                import('nsfwjs')
            ]);

            // Necessary for some environments to avoid issues with webgl
            await tf.ready();
            // Load models locally to avoid external network latency
            return (nsfwjs as SafeAny).load('/models/');
        })();
    }
    return modelPromise;
};

export interface ModerationResult {
    safe: boolean;
    reason: string | null;
    predictions: Record<string, number>;
}

/**
 * Classifies an image and returns whether it's safe.
 * Blocks if Porn or Hentai > threshold.
 */
export const isSafeImage = async (
    imageElement: HTMLImageElement | HTMLCanvasElement | ImageData,
    threshold: number = 0.6
): Promise<ModerationResult> => {
    const model = await loadModel();
    const predictions: SafeAny[] = await model.classify(imageElement);

    // Predictions are sorted by probability
    const results: Record<string, number> = {};
    predictions.forEach((p: SafeAny) => {
        results[p.className] = p.probability;
    });

    if (!results) return { safe: true, reason: null, predictions: {} };
    const isUnsafe = (results['Porn'] || 0) > threshold || (results['Hentai'] || 0) > threshold;

    return {
        safe: !isUnsafe,
        reason: isUnsafe ? 'A imagem contém conteúdo inadequado e não pode ser enviada.' : null,
        predictions: results
    };
};

/**
 * Helper to convert a File to an HTMLImageElement
 */
export const fileToImage = (file: File | Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error('Failed to read file target result'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
