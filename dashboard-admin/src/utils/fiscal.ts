/**
 * Utilitário de validação e formatação fiscal (CPF/CNPJ).
 * Desenvolvido seguindo os algoritmos oficiais de Módulo 11.
 */

/**
 * Remove todos os caracteres não numéricos de uma string.
 */
export const sanitizeDocument = (doc: string): string => {
    return doc.replace(/\D/g, '');
};

/**
 * Valida se a string é um CPF válido utilizando o algoritmo de Módulo 11.
 */
export const isValidCPF = (cpf: string): boolean => {
    const cleanCPF = sanitizeDocument(cpf);

    if (cleanCPF.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder: number;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

/**
 * Valida se a string é um CNPJ válido utilizando o algoritmo de Módulo 11.
 */
export const isValidCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = sanitizeDocument(cnpj);

    if (cleanCNPJ.length !== 14) return false;

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

    // Validação do primeiro dígito verificador
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validação do segundo dígito verificador
    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Formata dinamicamente um documento (CPF ou CNPJ) com máscara.
 */
export const formatDocument = (doc: string): string => {
    const clean = sanitizeDocument(doc);

    if (clean.length <= 11) {
        // Máscara CPF: 000.000.000-00
        return clean
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    } else {
        // Máscara CNPJ: 00.000.000/0000-00
        return clean
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
};
