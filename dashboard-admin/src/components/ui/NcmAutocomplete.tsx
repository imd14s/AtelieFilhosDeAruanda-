import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { FiscalService } from '../../services/FiscalService';
import type { NcmResponse } from '../../services/FiscalService';
import useDebounce from '../../hooks/useDebounce';
import { Loader2, Search, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface NcmAutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

export const NcmAutocomplete = forwardRef<HTMLDivElement, NcmAutocompleteProps>(
    ({ value, onChange, error, className, placeholder = "Buscar código NCM ou descrição...", disabled, ...props }, ref) => {
        const [inputValue, setInputValue] = useState(value || "");
        const [options, setOptions] = useState<NcmResponse[]>([]);
        const [isOpen, setIsOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [focusedIndex, setFocusedIndex] = useState(-1);

        const containerRef = useRef<HTMLDivElement>(null);
        const listboxRef = useRef<HTMLUListElement>(null);

        // Keep internal input sync if form resets
        useEffect(() => {
            if (value !== undefined && value !== inputValue) {
                setInputValue(value);
            }
        }, [value, inputValue]);

        const debouncedSearchTerm = useDebounce(inputValue, 400);

        // Fetch NCM suggestions
        useEffect(() => {
            let isMounted = true;

            const fetchNcms = async () => {
                // Only fetch if dropdown is open and term is long enough, and we aren't just reflecting a final selection
                // We assume a selection has 8 digits if exact
                if (!isOpen || debouncedSearchTerm.length < 2) {
                    setOptions([]);
                    return;
                }

                setIsLoading(true);
                try {
                    const results = await FiscalService.searchNcms(debouncedSearchTerm);
                    if (isMounted) {
                        setOptions(results || []);
                        setFocusedIndex(-1); // reset focus
                    }
                } catch (error) {
                    console.error("Failed to fetch NCMs", error);
                    if (isMounted) setOptions([]);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            };

            fetchNcms();

            return () => {
                isMounted = false;
            };
        }, [debouncedSearchTerm, isOpen]);

        // Close on click outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Handle Keyboard Navigation
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isOpen) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    setIsOpen(true);
                    e.preventDefault();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && focusedIndex < options.length && options[focusedIndex]) {
                        handleSelect(options[focusedIndex]!);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    break;
                case 'Tab':
                    setIsOpen(false);
                    break;
            }
        };

        // Scroll active item into view
        useEffect(() => {
            if (isOpen && focusedIndex >= 0 && listboxRef.current) {
                const activeItem = listboxRef.current.children[focusedIndex] as HTMLElement;
                if (activeItem) {
                    activeItem.scrollIntoView({ block: 'nearest' });
                }
            }
        }, [focusedIndex, isOpen]);

        const handleSelect = (option: NcmResponse) => {
            setInputValue(option.code);
            setIsOpen(false);
            if (onChange) {
                onChange(option.code);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setInputValue(val);
            setIsOpen(true);
            if (onChange) {
                onChange(val); // notify RHF about the partial/raw typing too
            }
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            setInputValue("");
            if (onChange) onChange("");
            if (inputRef.current) inputRef.current.focus();
        };

        // Forwarding the inner input ref to allow RHF to focus on errors,
        // while keeping the container ref for click-outside detection.
        const inputRef = useRef<HTMLInputElement>(null);
        React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

        return (
            <div
                ref={containerRef}
                className={cn("relative w-full", className)}
            >
                <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        disabled={disabled}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "w-full pl-9 pr-10 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 transition-colors",
                            error
                                ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                            disabled && "bg-gray-50 text-gray-500 cursor-not-allowed hidden-search",
                            isOpen && options.length > 0 && "rounded-b-none border-b-transparent focus:border-b-transparent", // connect visually
                        )}
                        {...props}
                    />

                    <div className="absolute right-3 flex items-center gap-1">
                        {isLoading && (
                            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                        )}
                        {!isLoading && inputValue && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                                tabIndex={-1}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

                {isOpen && inputValue.length > 0 && (
                    <div className="absolute z-50 w-full mt-[-1px] bg-white border border-gray-300 rounded-b-md shadow-lg max-h-60 overflow-y-auto" style={{ borderTopColor: '#e5e7eb' }}>
                        <ul ref={listboxRef} role="listbox" className="py-1">
                            {isLoading && options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center italic">
                                    Buscando NCMs...
                                </li>
                            ) : options.length > 0 ? (
                                options.map((option, index) => (
                                    <li
                                        key={`${option.code}-${index}`}
                                        role="option"
                                        aria-selected={focusedIndex === index}
                                        onClick={() => handleSelect(option)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                        className={cn(
                                            "cursor-pointer select-none px-4 py-2 text-sm",
                                            focusedIndex === index
                                                ? "bg-indigo-50 text-indigo-900"
                                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.code}</span>
                                            <span className="text-xs text-gray-500 truncate">{option.description}</span>
                                        </div>
                                    </li>
                                ))
                            ) : inputValue.length >= 2 && !isLoading ? (
                                <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                    Nenhum código NCM encontrado.
                                </li>
                            ) : null}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
);

NcmAutocomplete.displayName = 'NcmAutocomplete';
