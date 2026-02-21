import React, { useState } from 'react';
import { Search, MessageSquare, CornerDownRight } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';

const MOCK_QUESTIONS = [
    {
        id: 'q1',
        productName: 'Kit Energia Firmeza de Exu',
        image: '/images/default.png',
        question: 'Olá! Qual o prazo de validade das velas inclusas no kit?',
        date: '10 de Dezembro de 2025',
        status: 'ANSWERED',
        answer: 'Bom dia! As velas têm validade indeterminada desde que mantidas em local seco e fresco. Axé!',
        answerDate: '10 de Dezembro de 2025'
    },
    {
        id: 'q2',
        productName: 'Imagem Zé Pelintra Resina 20cm',
        image: '/images/default.png',
        question: 'A pintura é resistente a lavagem com água e sabão neutro?',
        date: '05 de Dezembro de 2025',
        status: 'PENDING',
        answer: null,
        answerDate: null
    }
];

const QuestionsPage = () => {
    const { user } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');

    if (!user) return null;

    const filteredQuestions = MOCK_QUESTIONS.filter(q =>
        q.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Minhas Perguntas" description="Acompanhe as perguntas que você fez aos vendedores." />

            <div className="max-w-5xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 font-playfair">Perguntas</h1>
                        <p className="text-gray-500 text-sm mt-1">Acompanhe as dúvidas que você tirou antes de comprar.</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-full md:w-1/2">
                        <input
                            type="text"
                            placeholder="Buscar nas minhas perguntas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Lista de Perguntas */}
                <div className="space-y-4">
                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-md border border-gray-200">
                            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1.5} />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma pergunta encontrada</h3>
                            <p className="text-gray-500 text-sm">Tire suas dúvidas nos anúncios antes de comprar.</p>
                        </div>
                    ) : (
                        filteredQuestions.map((item) => (
                            <div key={item.id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">

                                {/* Cabeçalho do Card (Produto) */}
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                                    <div className="w-12 h-12 shrink-0 border border-gray-200 rounded p-1 bg-white">
                                        <img src={item.image} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</h3>
                                        <Link to="/store" className="text-xs text-blue-500 hover:text-blue-600 transition-colors">Ver anúncio</Link>
                                    </div>

                                    {/* Badge Status */}
                                    <div>
                                        {item.status === 'ANSWERED' ? (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Respondida</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Aguardando</span>
                                        )}
                                    </div>
                                </div>

                                {/* Corpo da Pergunta/Resposta */}
                                <div className="p-6">
                                    {/* A Pergunta */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                            <MessageSquare size={16} />
                                        </div>
                                        <div>
                                            <p className="text-gray-800 text-sm mb-1">{item.question}</p>
                                            <p className="text-xs text-gray-400">{item.date}</p>
                                        </div>
                                    </div>

                                    {/* A Resposta (se houver) */}
                                    {item.status === 'ANSWERED' && (
                                        <div className="flex gap-4 mt-4 ml-4 pl-4 border-l-2 border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                                <CornerDownRight size={16} />
                                            </div>
                                            <div>
                                                <p className="text-gray-700 text-sm mb-1">{item.answer}</p>
                                                <p className="text-xs text-gray-400">{item.answerDate}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionsPage;
