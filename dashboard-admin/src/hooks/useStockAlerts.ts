import { useState, useEffect, useCallback, useMemo } from 'react';
import { StockAlertService, type StockAlertSettings, type StockPriority } from '../services/StockAlertService';
import { ProductService } from '../services/ProductService';
import type { Product } from '../types/product';

export const STOCK_COLORS = {
    red: { label: 'Crítico', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    amber: { label: 'Atenção', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    blue: { label: 'Informativo', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    indigo: { label: 'Preferencial', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
} as const;

export type ColorPreset = keyof typeof STOCK_COLORS;

/**
 * Calcula a prioridade de um produto com base no estoque e configurações.
 * Exportado para reuso em outros componentes (ex: ProductsPage).
 */
export const calculatePriority = (stock: number, settings: StockAlertSettings | null) => {
    if (!settings) return null;

    // Encontrar a prioridade correspondente (menor maxLevel primeiro)
    return [...settings.priorities]
        .sort((a, b) => a.maxLevel - b.maxLevel)
        .find(pr => stock <= pr.maxLevel) || null;
};

export function useStockAlerts() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<StockAlertSettings | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [alertSettings, allProducts] = await Promise.all([
                StockAlertService.getSettings(),
                ProductService.getAll()
            ]);
            setSettings(alertSettings);
            setProducts(allProducts);
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        setSuccess(false);
        try {
            await StockAlertService.saveSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const updateThreshold = (threshold: number) => {
        if (!settings) return;
        setSettings({ ...settings, threshold });
    };

    const updateTemplate = (messageTemplate: string) => {
        if (!settings) return;
        setSettings({ ...settings, messageTemplate });
    };

    const addPriority = () => {
        if (!settings) return;
        const newPriority: StockPriority = {
            label: 'Novo Nível',
            maxLevel: 5,
            color: 'red' // Default preset
        };
        setSettings({ ...settings, priorities: [...settings.priorities, newPriority] });
    };

    const removePriority = (index: number) => {
        if (!settings) return;
        setSettings({
            ...settings,
            priorities: settings.priorities.filter((_, i) => i !== index)
        });
    };

    const updatePriority = (index: number, field: keyof StockPriority, value: string | number) => {
        if (!settings) return;
        const newPriorities = [...settings.priorities];
        newPriorities[index] = { ...newPriorities[index], [field]: value } as StockPriority;
        setSettings({ ...settings, priorities: newPriorities });
    };

    const lowStockProducts = useMemo(() => {
        if (!settings) return [];

        return products
            .filter(p => (p.stock || 0) <= settings.threshold + 20)
            .map(p => ({
                ...p,
                currentPriority: calculatePriority(p.stock || 0, settings)
            }))
            .sort((a, b) => (a.stock || 0) - (b.stock || 0));
    }, [products, settings]);

    return {
        loading,
        saving,
        success,
        settings,
        lowStockProducts,
        updateThreshold,
        updateTemplate,
        addPriority,
        removePriority,
        updatePriority,
        saveSettings,
        refresh: loadData
    };
}
