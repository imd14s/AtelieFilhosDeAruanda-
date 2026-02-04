import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Store, MapPin, CheckCircle } from 'lucide-react';


export function SetupWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        phone: '',
        logo: null as File | null
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        // Aqui chamaria o backend para atualizar o Tenant atual
        // await TenantService.updateCurrent(formData);
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            {/* Steps Indicator */}
            <div className="w-full max-w-2xl mb-8 flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
                <div className={`absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-50 font-bold transition-colors ${step >= i ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                        {step > i ? <Check size={20} /> : i}
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl min-h-[400px] flex flex-col">

                {/* Step 1: Dados da Loja */}
                {step === 1 && (
                    <div className="flex-1 space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Vamos configurar sua loja</h2>
                            <p className="text-gray-500">Comece informando os dados básicos</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome da Loja</label>
                            <input
                                className="w-full p-3 border rounded-lg mt-1"
                                placeholder="Ex: Minha Loja Incrível"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                            <textarea
                                className="w-full p-3 border rounded-lg mt-1"
                                placeholder="O que você vende?"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Endereço */}
                {step === 2 && (
                    <div className="flex-1 space-y-4">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Onde você está localizado?</h2>
                            <p className="text-gray-500">Isso ajuda no cálculo do frete</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                                <input
                                    className="w-full p-3 border rounded-lg mt-1"
                                    placeholder="Rua das Flores, 123"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                                <input
                                    className="w-full p-3 border rounded-lg mt-1"
                                    placeholder="São Paulo"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                                <input
                                    className="w-full p-3 border rounded-lg mt-1"
                                    placeholder="(11) 99999-9999"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Conclusão */}
                {step === 3 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Tudo Pronto!</h2>
                        <p className="text-gray-500 max-w-sm">
                            Sua loja <strong>{formData.name}</strong> foi configurada com sucesso. Você já pode cadastrar produtos e começar a vender.
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    {step > 1 && step < 3 ? (
                        <button onClick={handleBack} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Voltar
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={!formData.name && step === 1}
                            className="bg-indigo-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 w-full justify-center"
                        >
                            Ir para o Dashboard
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
