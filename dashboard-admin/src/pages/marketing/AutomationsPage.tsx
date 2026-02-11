import { Zap } from "lucide-react";

export function AutomationsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-indigo-100 p-6 rounded-full">
                <Zap className="w-16 h-16 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Automações & IA</h1>
            <p className="text-gray-500 max-w-md">
                Esta funcionalidade está em desenvolvimento. Em breve você poderá configurar fluxos automáticos e integrações inteligentes.
            </p>
            <div className="pt-4">
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                    Em Construção
                </span>
            </div>
        </div>
    );
}
