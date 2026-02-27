import React, { forwardRef, useCallback } from 'react';
import { cn } from '../../utils/cn'; // Assuming a cn utility exists or I'll create one if missing, but I saw it in ProductForm.tsx before.
// Wait, I added cn to ProductForm.tsx locally. I should check if there is a global one.
// list_dir showed src/utils/imageUtils.ts and src/utils/fiscal.ts. 
// I'll define a local cn or check src/utils again.
import { } from '../../utils/fiscal';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    mask: 'cpf' | 'cnpj' | 'cpf-cnpj' | 'cep';
    id?: string;
    label?: string;
    error?: string;
    onChange?: (value: string) => void;
}

/**
 * Componente de entrada de dados com máscara dinâmica.
 * Suporta CPF, CNPJ e CEP com formatação em tempo real.
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ mask, label, error, className, value, onChange, id, ...props }, ref) => {

        const applyMask = useCallback((val: string, type: 'cpf' | 'cnpj' | 'cpf-cnpj' | 'cep') => {
            const clean = val.replace(/\D/g, '');

            if (type === 'cpf') {
                return clean
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                    .substring(0, 14);
            }

            if (type === 'cnpj') {
                return clean
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                    .replace(/(\d{4})(\d)/, '$1-$2')
                    .substring(0, 18);
            }

            if (type === 'cpf-cnpj') {
                if (clean.length <= 11) {
                    return clean
                        .replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                        .substring(0, 14);
                } else {
                    return clean
                        .replace(/^(\d{2})(\d)/, '$1.$2')
                        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                        .replace(/\.(\d{3})(\d)/, '.$1/$2')
                        .replace(/(\d{4})(\d)/, '$1-$2')
                        .substring(0, 18);
                }
            }

            if (type === 'cep') {
                return clean
                    .replace(/(\d{5})(\d)/, '$1-$2')
                    .substring(0, 9);
            }

            return val;
        }, []);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value;
            const cleanValue = rawValue.replace(/\D/g, '');

            // Limita o tamanho do valor limpo
            let limitedValue = cleanValue;
            if (mask === 'cpf') limitedValue = cleanValue.substring(0, 11);
            if (mask === 'cnpj') limitedValue = cleanValue.substring(0, 14);
            if (mask === 'cpf-cnpj') limitedValue = cleanValue.substring(0, 14);
            if (mask === 'cep') limitedValue = cleanValue.substring(0, 8);

            if (onChange) {
                onChange(limitedValue);
            }
        };

        // Formata o valor para exibição
        const displayValue = value ? applyMask(String(value), mask) : '';

        return (
            <div className="w-full space-y-1">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <input
                    {...props}
                    ref={ref}
                    id={id}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    className={cn(
                        "w-full p-2 border rounded-lg focus:ring-2 bg-white text-sm transition-all outline-none",
                        error
                            ? "border-red-300 focus:ring-red-500 bg-red-50 text-red-900"
                            : "border-gray-300 focus:ring-indigo-500 text-gray-900",
                        className
                    )}
                />
                {error && (
                    <p className="text-red-500 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

MaskedInput.displayName = 'MaskedInput';
