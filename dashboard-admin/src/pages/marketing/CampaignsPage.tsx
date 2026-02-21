import React, { useState } from 'react';
import { Mail, Users, Send, CheckCircle, Clock, AlertCircle, BarChart3, Plus, ArrowUpRight } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    type: 'NEWSLETTER' | 'PROMO' | 'ABANDONED_CART';
    status: 'SENT' | 'SCHEDULED' | 'DRAFT';
    recipients: number;
    openRate: number;
    clickRate: number;
    sentAt: string;
}

export function CampaignsPage() {
    const [campaigns] = useState<Campaign[]>([
        {
            id: '1',
            name: 'Newsletter de Fevereiro - Axé e Velas',
            type: 'NEWSLETTER',
            status: 'SENT',
            recipients: 1250,
            openRate: 42.5,
            clickRate: 12.8,
            sentAt: '2026-02-15T10:00:00',
        },
        {
            id: '2',
            name: 'Promoção de Carnaval',
            type: 'PROMO',
            status: 'SENT',
            recipients: 3400,
            openRate: 38.2,
            clickRate: 15.1,
            sentAt: '2026-02-10T09:00:00',
        },
        {
            id: '3',
            name: 'Lançamento Coleção Orixás',
            type: 'NEWSLETTER',
            status: 'SCHEDULED',
            recipients: 5000,
            openRate: 0,
            clickRate: 0,
            sentAt: '2026-03-01T08:00:00',
        }
    ]);

    const stats = [
        { label: 'Total Assinantes', value: '12,450', change: '+12%', icon: Users },
        { label: 'Emails Enviados (Mês)', value: '45,200', change: '+5%', icon: Send },
        { label: 'Taxa Média de Cliques', value: '14.2%', change: '+2%', icon: BarChart3 },
        { label: 'Conversão em Cupons', value: '8.5%', change: '+1.2%', icon: CheckCircle },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campanhas de Marketing</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas comunicações por e-mail e acompanhe o engajamento.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                    <Plus size={18} />
                    Nova Campanha
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <stat.icon size={20} />
                            </div>
                            <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full">
                                {stat.change}
                                <ArrowUpRight size={12} className="ml-1" />
                            </span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                        <span className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">Listagem de Campanhas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Nome da Campanha</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Destinatários</th>
                                <th className="px-6 py-4 text-center">Abertura</th>
                                <th className="px-6 py-4 text-center">Cliques</th>
                                <th className="px-6 py-4 text-center">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{camp.name}</div>
                                                <div className="text-xs text-gray-500 uppercase">{camp.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${camp.status === 'SENT' ? 'bg-green-50 text-green-700' :
                                                camp.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-gray-50 text-gray-700'
                                            }`}>
                                            {camp.status === 'SENT' ? <CheckCircle size={12} /> :
                                                camp.status === 'SCHEDULED' ? <Clock size={12} /> :
                                                    <AlertCircle size={12} />}
                                            {camp.status === 'SENT' ? 'Enviado' :
                                                camp.status === 'SCHEDULED' ? 'Agendado' : 'Rascunho'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                                        {camp.recipients.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-medium text-gray-900">{camp.openRate}%</div>
                                        <div className="w-20 mx-auto h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${camp.openRate}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-medium text-gray-900">{camp.clickRate}%</div>
                                        <div className="w-20 mx-auto h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${camp.clickRate}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                        {new Date(camp.sentAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
