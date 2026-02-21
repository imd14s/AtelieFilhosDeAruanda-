import { Sparkles, Mail, Users, Send, BarChart3 } from 'lucide-react';

export function CampaignsPage() {
    const stats = [
        { label: 'Total Assinantes', value: '0', icon: Users },
        { label: 'Emails Enviados (Mês)', value: '0', icon: Send },
        { label: 'Taxa Média de Cliques', value: '0%', icon: BarChart3 },
        { label: 'Campanhas Ativas', value: '0', icon: Mail },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campanhas de Marketing</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas comunicações por e-mail e acompanhe o engajamento.</p>
                </div>
            </div>

            {/* Stats Grid — zerados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                        <span className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Em Breve — substitui tabela fake */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-16 text-center">
                    <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-indigo-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Campanhas de E-mail — Em Breve!
                    </h3>

                    <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                        Em breve você poderá criar campanhas de e-mail, acompanhar taxas de abertura e cliques,
                        e segmentar seus clientes. Essa funcionalidade será liberada em uma atualização futura.
                    </p>
                </div>
            </div>
        </div>
    );
}
