
import { X, Settings, AlertTriangle } from 'lucide-react';

interface FeatureGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function FeatureGateModal({ isOpen, onClose, featureName }: FeatureGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-yellow-600" size={32} />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Configuração Necessária
          </h3>

          <p className="text-gray-600 mb-6">
            A funcionalidade <strong>{featureName}</strong> requer integração externa (n8n / OpenAI) que ainda não foi configurada neste ambiente.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg text-left w-full mb-6 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Próximos Passos:</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
              <li>Configurar variáveis de ambiente (.env)</li>
              <li>Ativar Webhook no n8n</li>
              <li>Inserir chave de API (OpenAI/Stable Diffusion)</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
          >
            <Settings size={18} />
            Ir para Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
