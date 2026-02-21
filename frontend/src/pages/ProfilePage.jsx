import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Shield, CreditCard, MapPin, MessageCircle, Mail } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useOutletContext();

    return (
        <div className="w-full pb-12">
            {/* Header / Avatar */}
            <div className="flex items-center gap-6 mb-8 mt-2">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-playfair text-[#0f2A44] font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                    )}
                    <div className="absolute inset-0 border-2 border-[#C9A24D] rounded-full"></div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                    <p className="text-sm text-gray-600 font-medium">{user?.email}</p>
                </div>
            </div>

            {/* Banner de Validação */}
            <div className="bg-white border-l-4 border-amber-500 shadow-sm rounded-md p-4 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Mail className="text-gray-500 shrink-0" size={20} />
                    <span className="text-gray-800 font-semibold text-sm">Valide seu e-mail e mantenha sua conta segura</span>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="px-5 py-2 bg-blue-500 text-white font-semibold text-sm rounded-md hover:bg-blue-600 transition-colors w-full md:w-auto text-center shrink-0">
                        Validar
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 ml-2 hidden md:block">✕</button>
                </div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Informações */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow relative">
                    <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-6 right-6"></div>
                    <User className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Informações do seu perfil</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Dados pessoais e da conta.</p>
                </div>

                {/* 2. Segurança */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow relative">
                    <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-6 right-6"></div>
                    <Shield className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Segurança</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Você tem configurações pendentes.</p>
                </div>

                {/* 3. Meli+ (Mock para Ateliê+) */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-4">
                        <span className="font-bold text-sm text-gray-600">A+</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Ateliê+</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Assinatura com benefícios em frete, compras e axé.</p>
                </div>

                {/* 4. Cartões */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <CreditCard className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Cartões</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Cartões salvos na sua conta.</p>
                </div>

                {/* 5. Endereços */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <MapPin className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Endereços</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Endereços salvos na sua conta.</p>
                </div>

                {/* 6. Privacidade */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <Shield className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Privacidade</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Preferências e controle do uso dos seus dados.</p>
                </div>

                {/* 7. Comunicações */}
                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                    <MessageCircle className="text-gray-400 mb-4" size={28} strokeWidth={1.5} />
                    <h3 className="font-semibold text-gray-800 mb-1">Comunicações</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Escolha que tipo de informação você quer receber.</p>
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-500 pt-4">
                Você pode <button className="text-blue-500 hover:text-blue-600 font-medium transition-colors">cancelar sua conta</button> quando quiser.
            </div>
        </div>
    );
};

export default ProfilePage;
