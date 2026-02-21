
import CreatableSelect from 'react-select/creatable';
import type { Category } from '../../types/category';

interface CreatableCategorySelectProps {
    categories: Category[];
    value: string;
    onChange: (value: string, newCategoryName?: string) => void;
    error?: string;
}

export function CreatableCategorySelect({ categories, value, onChange, error }: CreatableCategorySelectProps) {
    // Map our categories to react-select options format
    const options = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        isNew: false
    }));

    // Find the selected option. If it's a new category (starts with NEW_), construct a temporary option
    const selectedOption = value?.startsWith('NEW_')
        ? { value, label: value.replace('NEW_', ''), isNew: true }
        : options.find((opt) => opt.value === value) || null;

    const handleChange = (newValue: any) => {
        if (!newValue) {
            onChange('');
            return;
        }

        if (newValue.__isNew__) {
            // The user created a new category (transient)
            onChange(`NEW_${newValue.label}`, newValue.label);
        } else {
            // The user selected an existing category
            onChange(newValue.value);
        }
    };

    // Rule: Only allow creating a new category if the typed name has at least 3 characters
    // and it doesn't already exist in the options list
    const isValidNewOption = (inputValue: string, _selectValue: any, selectOptions: readonly any[]) => {
        if (inputValue.trim().length < 3) return false;
        const exactMatch = selectOptions.some(
            (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase()
        );
        return !exactMatch;
    };

    return (
        <div className="w-full">
            <CreatableSelect
                isClearable
                options={options}
                value={selectedOption}
                onChange={handleChange as any}
                isValidNewOption={isValidNewOption}
                formatCreateLabel={(inputValue) => `Adicionar "${inputValue}"`}
                placeholder="Selecione ou digite para adicionar uma categoria..."
                noOptionsMessage={({ inputValue }) =>
                    inputValue.length < 3
                        ? "Digite 3 ou mais letras para ver opções ou criar"
                        : "Nenhuma categoria existente encontrada."
                }
                styles={{
                    control: (base, state) => ({
                        ...base,
                        borderColor: error ? '#ef4444' : state.isFocused ? '#6366f1' : '#e5e7eb',
                        boxShadow: state.isFocused ? (error ? '0 0 0 1px #ef4444' : '0 0 0 1px #6366f1') : 'none',
                        '&:hover': {
                            borderColor: error ? '#ef4444' : state.isFocused ? '#6366f1' : '#d1d5db',
                        },
                        padding: '2px',
                        borderRadius: '0.5rem',
                        backgroundColor: 'white'
                    })
                }}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
