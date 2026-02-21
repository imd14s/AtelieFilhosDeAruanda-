import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';

let modelPromise = null;

/**
 * Loads the NSFW model once.
 */
export const loadModel = async () => {
    if (!modelPromise) {
        // Necessary for some environments to avoid issues with webgl
        await tf.ready();
        modelPromise = nsfwjs.load();
    }
    return modelPromise;
};

/**
 * Classifies an image and returns whether it's safe.
 * Blocks if Porn or Hentai > threshold.
 */
export const isSafeImage = async (imageElement, threshold = 0.6) => {
    const model = await loadModel();
    const predictions = await model.classify(imageElement);

    // Predictions are sorted by probability
    const results = {};
    predictions.forEach(p => {
        results[p.className] = p.probability;
    });

    const isUnsafe = results['Porn'] > threshold || results['Hentai'] > threshold;

    return {
        safe: !isUnsafe,
        reason: isUnsafe ? 'A imagem contém conteúdo inadequado e não pode ser enviada.' : null,
        predictions: results
    };
};

/**
 * Helper to convert a File to an HTMLImageElement
 */
export const fileToImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
