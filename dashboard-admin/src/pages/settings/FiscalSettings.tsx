import { Hammer } from 'lucide-react';

export function FiscalSettings() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 max-w-2xl mx-auto text-center px-4">
            <div className="p-6 bg-amber-50 rounded-full shadow-inner animate-pulse">
                <Hammer className="text-amber-600" size={64} />
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    Módulo em Manutenção
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed">
                    Estamos aprimorando nossas integrações fiscais para oferecer uma experiência mais robusta e automatizada.
                    Esta seção voltará a ficar disponível em breve.
                </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex-1">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</span>
                    <span className="text-amber-600 font-bold flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        Em desenvolvimento
                    </span>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex-1">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Previsão</span>
                    <span className="text-gray-700 font-bold">Q2 2026</span>
                </div>
            </div>

            <p className="text-xs text-gray-400 italic">
                Agradecemos a sua paciência. Em caso de dúvidas, entre em contato com o suporte do Ateliê.
            </p>
        </div>
    );
}
