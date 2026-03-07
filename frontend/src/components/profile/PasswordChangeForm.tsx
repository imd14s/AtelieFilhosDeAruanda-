import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface PasswordChangeFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSuccess, onCancel }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/profile/password', {
                currentPassword,
                newPassword,
                confirmPassword
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao alterar senha. Verifique sua senha atual.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Senha Alterada!</h3>
                <p className="text-gray-600 mt-2">Sua senha foi atualizada com sucesso.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock size={16} />
                    </span>
                    <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--azul-profundo)] focus:border-[var(--azul-profundo)] bg-gray-50 text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock size={16} />
                    </span>
                    <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--azul-profundo)] focus:border-[var(--azul-profundo)] bg-gray-50 text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock size={16} />
                    </span>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--azul-profundo)] focus:border-[var(--azul-profundo)] bg-gray-50 text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-[var(--azul-profundo)] text-white rounded-lg text-sm font-bold hover:bg-[#0a1e33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Troca'}
                </button>
            </div>
        </form>
    );
};

export default PasswordChangeForm;
