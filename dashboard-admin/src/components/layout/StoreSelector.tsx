import { useTenant } from '../../context/TenantContext';
import { Store, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function StoreSelector() {
    const { currentTenant, tenants, switchTenant, isLoading } = useTenant();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) return <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />;
    if (!currentTenant) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-700/50 hover:bg-indigo-700/70 rounded-lg text-white transition-colors min-w-[200px] border border-indigo-500/30"
            >
                <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center">
                    {currentTenant.logoUrl ? (
                        <img src={currentTenant.logoUrl} className="w-full h-full object-cover rounded" />
                    ) : (
                        <Store size={18} className="text-white" />
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-xs text-indigo-200">Loja Atual</p>
                    <p className="text-sm font-medium truncate">{currentTenant.name}</p>
                </div>
                <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden py-1">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suas Lojas</p>
                        </div>
                        {tenants.map(tenant => (
                            <button
                                key={tenant.id}
                                onClick={() => {
                                    switchTenant(tenant.id);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors",
                                    currentTenant.id === tenant.id && "bg-indigo-50"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded flex items-center justify-center",
                                    currentTenant.id === tenant.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    <Store size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className={clsx("text-sm font-medium", currentTenant.id === tenant.id ? "text-indigo-900" : "text-gray-700")}>
                                        {tenant.name}
                                    </p>
                                    <p className="text-xs text-gray-400">{tenant.slug}</p>
                                </div>
                                {currentTenant.id === tenant.id && <Check size={16} className="text-indigo-600" />}
                            </button>
                        ))}
                        <div className="border-t border-gray-100 p-2">
                            <button className="w-full py-2 text-xs text-center text-indigo-600 font-medium hover:bg-indigo-50 rounded bg-white border border-indigo-100 border-dashed">
                                + Criar Nova Loja
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
