import { api } from '../api/axios';

export interface StockPriority {
    label: string;
    maxLevel: number;
    color: string;
}

export interface StockAlertSettings {
    threshold: number;
    messageTemplate: string;
    priorities: StockPriority[];
}

const DEFAULT_SETTINGS: StockAlertSettings = {
    threshold: 10,
    messageTemplate: 'O produto {product} atingiu o estoque baixo de {stock} unidades.',
    priorities: [
        { label: 'Crítico', maxLevel: 5, color: 'red' },
        { label: 'Atenção', maxLevel: 15, color: 'amber' },
    ]
};

const CONFIG_KEY = 'inventory.alert_settings';

export const StockAlertService = {
    getSettings: async (): Promise<StockAlertSettings> => {
        try {
            const { data } = await api.get('/admin/configs');
            const config = data.find((c: Record<string, unknown>) => c.configKey === CONFIG_KEY);

            if (config && typeof config.configJson === 'string') {
                return JSON.parse(config.configJson);
            }

            return DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Erro ao buscar configurações de alerta:', error);
            return DEFAULT_SETTINGS;
        }
    },

    saveSettings: async (settings: StockAlertSettings): Promise<void> => {
        await api.post('/admin/configs', {
            configKey: CONFIG_KEY,
            configJson: JSON.stringify(settings)
        });
    }
};
