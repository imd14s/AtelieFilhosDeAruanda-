import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditLogPage } from './AuditLogPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '../../services/AuditService';

vi.mock('../../services/AuditService', () => ({
    AuditService: {
        getAll: vi.fn()
    }
}));

describe('AuditLogPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list audit logs', async () => {
        (AuditService.getAll as import('vitest').Mock).mockResolvedValueOnce([
            { id: '1', action: 'CREATE', resource: 'Produto', details: 'Criou vela', timestamp: '2023-10-10T10:00:00Z', performedBy: { name: 'Admin' } }
        ]);

        render(<AuditLogPage />);

        expect(screen.getByText('Carregando logs...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('CREATE')).toBeInTheDocument();
            expect(screen.getByText('Produto')).toBeInTheDocument();
            expect(screen.getByText('Criou vela')).toBeInTheDocument();
            expect(screen.getByText('Admin')).toBeInTheDocument();
        });
    });

    it('should show empty state when no logs exist', async () => {
        (AuditService.getAll as import('vitest').Mock).mockResolvedValueOnce([]);

        render(<AuditLogPage />);

        await waitFor(() => {
            expect(screen.getByText('Nenhum registro de auditoria encontrado.')).toBeInTheDocument();
        });
    });

    it('should filter logs by action', async () => {
        (AuditService.getAll as import('vitest').Mock).mockResolvedValue([]);

        render(<AuditLogPage />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'DELETE' } });

        await waitFor(() => {
            expect(AuditService.getAll).toHaveBeenCalledWith({ action: 'DELETE' });
        });
    });

    it('should display fallback user when performedBy is missing', async () => {
        (AuditService.getAll as import('vitest').Mock).mockResolvedValueOnce([
            { id: '1', action: 'LOGIN', resource: 'Auth', details: 'Fez login', timestamp: '2023-10-10T10:00:00Z', performedBy: null }
        ]);

        render(<AuditLogPage />);

        await waitFor(() => {
            expect(screen.getByText('LOGIN')).toBeInTheDocument();
            expect(screen.getByText('Sistema')).toBeInTheDocument(); // Fallback for empty performedBy.name
        });
    });
});
