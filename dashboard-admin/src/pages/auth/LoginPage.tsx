import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token);
      addToast('Bem-vindo ao painel!', 'success');
      navigate('/');
    } catch {
      addToast('Credenciais inválidas. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Acesso Administrativo</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="admin@atelie.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              {...register('password')}
              id="password"
              type="password"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••"
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
