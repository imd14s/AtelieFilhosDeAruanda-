import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import ProfilePage from './ProfilePage';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import api from '../services/api';
import { authService } from '../services/authService';
import * as router from 'react-router-dom';

// Mock do OutletContext para fornecer o usuário
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useOutletContext: vi.fn(),
        useNavigate: vi.fn(),
    };
});

// Mock dos serviços
vi.mock('../services/api', () => ({
    default: {
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: {
            baseURL: 'http://localhost:8080/api'
        }
    }
}));

vi.mock('../services/authService', () => ({
    authService: {
        logout: vi.fn(),
        updateProfile: vi.fn(),
    }
}));

// Mock do react-easy-crop
vi.mock('react-easy-crop', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ onCropComplete }: any) => {
        // Simular o crop complete quando o cropper monta
        setTimeout(() => onCropComplete({}, { width: 100, height: 100, x: 0, y: 0 }), 0);
        return <div data-testid="cropper" />;
    }
}));

vi.mock('../utils/imageUtils', () => ({
    getCroppedImg: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' }))
}));

describe('ProfilePage Component', () => {
    const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        photoUrl: null,
        googleId: null,
        document: ''
    };

    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (router.useOutletContext as Mock).mockReturnValue({ user: mockUser });
        (router.useNavigate as Mock).mockReturnValue(mockNavigate);
        vi.useRealTimers();
    });

    it('renders user information correctly', () => {
        render(<ProfilePage />);
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('shows verification banner if email is not verified', async () => {
        (router.useOutletContext as Mock).mockReturnValue({
            user: { ...mockUser, emailVerified: false }
        });
        render(<ProfilePage />);
        expect(screen.getByText('Verifique seu e-mail')).toBeInTheDocument();

        const resendButton = screen.getByText('Validar E-mail');
        await act(async () => {
            fireEvent.click(resendButton);
        });
        expect(api.post).toHaveBeenCalledWith('/users/resend-verification', { email: mockUser.email });
    });

    it('handles profile update successfully (Happy Path)', async () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('Dados Pessoais'));

        const nameInput = await screen.findByDisplayValue('Test User');
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

        const submitButton = screen.getByText('Salvar Alterações');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(authService.updateProfile).toHaveBeenCalledWith({
                name: 'Updated Name',
                document: ''
            });
            expect(screen.getByText('Perfil atualizado com sucesso!')).toBeInTheDocument();
        });
    });

    it('handles password reset request successfully', async () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('Segurança'));

        const submitButton = screen.getByText('Solicitar Redefinição');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockUser.email });
            expect(screen.getByText('Link de redefinição enviado!')).toBeInTheDocument();
        });
    });

    it('handles account deletion (Happy Path)', async () => {
        render(<ProfilePage />);

        fireEvent.click(screen.getByText('Deseja cancelar sua conta?'));

        const confirmButton = screen.getByText('Confirmar Exclusão');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith(`/users/${mockUser.id}`);
            expect(authService.logout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('shows error message if profile update fails', async () => {
        const errorMsg = 'Invalid data';
        (authService.updateProfile as Mock).mockRejectedValue({
            response: { data: { message: errorMsg } }
        });

        render(<ProfilePage />);
        fireEvent.click(screen.getByText('Dados Pessoais'));

        const submitButton = await screen.findByText('Salvar Alterações');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });
    });

    it('shows error message if account deletion fails', async () => {
        (api.delete as Mock).mockRejectedValue(new Error('Deletion failed'));

        render(<ProfilePage />);
        fireEvent.click(screen.getByText('Deseja cancelar sua conta?'));

        const confirmButton = await screen.findByText('Confirmar Exclusão');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Erro ao cancelar conta. Entre em contato com o suporte.')).toBeInTheDocument();
        });
    });

    it('validates CPF format before update', async () => {
        render(<ProfilePage />);
        fireEvent.click(screen.getByText('Dados Pessoais'));

        const docInput = await screen.findByLabelText(/CPF ou CNPJ/i);
        fireEvent.change(docInput, { target: { value: '11111111111' } });

        const submitButton = screen.getByText('Salvar Alterações');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Por favor, insira um CPF ou CNPJ válido.')).toBeInTheDocument();
            expect(authService.updateProfile).not.toHaveBeenCalled();
        });
    });

    it('closes modal when clicking close button', async () => {
        render(<ProfilePage />);
        fireEvent.click(screen.getByText('Dados Pessoais'));
        expect(await screen.findByText('Salvar Alterações')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('Close');
        await act(async () => {
            fireEvent.click(closeButton);
        });

        await waitFor(() => {
            expect(screen.queryByText('Salvar Alterações')).not.toBeInTheDocument();
        });
    });

    it('handles photo upload process successfully', async () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        (api.post as Mock).mockResolvedValue({ data: { id: 'img123' } });
        (api.patch as Mock).mockResolvedValue({});

        // Mock FileReader constructor manually
        const mockInstance = {
            readAsDataURL: vi.fn(function (this: { onload: () => void }) {
                this.onload();
            }),
            result: 'data:image/png;base64,hello',
            onload: () => { }
        };

        class MockFileReader {
            constructor() { return mockInstance; }
            readAsDataURL(file: File) { mockInstance.readAsDataURL(file); }
            set onload(fn: () => void) { mockInstance.onload = fn; }
            get result() { return mockInstance.result; }
        }

        vi.stubGlobal('FileReader', MockFileReader);

        render(<ProfilePage />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = document.getElementById('photo-upload') as HTMLInputElement;

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        await screen.findByText('Ajustar Foto');

        const saveButton = screen.getByText('Salvar Foto');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(api.patch).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
            expect(screen.queryByText('Ajustar Foto')).not.toBeInTheDocument();
        });

        vi.unstubAllGlobals();
    });

    it('handles photo upload error', async () => {
        (api.post as Mock).mockRejectedValue({ response: { data: { message: 'Upload failed' } } });

        const mockInstance = {
            readAsDataURL: vi.fn(function (this: { onload: () => void }) {
                this.onload();
            }),
            result: 'data:image/png;base64,hello',
            onload: () => { }
        };

        class MockFileReader {
            constructor() { return mockInstance; }
            readAsDataURL(file: File) { mockInstance.readAsDataURL(file); }
            set onload(fn: () => void) { mockInstance.onload = fn; }
            get result() { return mockInstance.result; }
        }

        vi.stubGlobal('FileReader', MockFileReader);

        render(<ProfilePage />);
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = document.getElementById('photo-upload') as HTMLInputElement;

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        await screen.findByText('Ajustar Foto');
        const saveButton = screen.getByText('Salvar Foto');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Upload failed')).toBeInTheDocument();
        });

        vi.unstubAllGlobals();
    });

    it('shows initials when photoUrl is missing', () => {
        (router.useOutletContext as Mock).mockReturnValue({
            user: { ...mockUser, name: 'John Doe', photoUrl: null }
        });
        render(<ProfilePage />);
        expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('highlights zoom slider changes', async () => {
        const mockInstance = {
            readAsDataURL: vi.fn(function (this: { onload: () => void }) { this.onload(); }),
            result: 'data:image/png;base64,hello',
            onload: () => { }
        };
        class MockFileReader {
            constructor() { return mockInstance; }
            readAsDataURL(file: File) { mockInstance.readAsDataURL(file); }
            set onload(fn: () => void) { mockInstance.onload = fn; }
            get result() { return mockInstance.result; }
        }
        vi.stubGlobal('FileReader', MockFileReader);

        render(<ProfilePage />);
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = document.getElementById('photo-upload') as HTMLInputElement;
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        await screen.findByText('Ajustar Foto');
        const zoomInput = screen.getByLabelText('Zoom') as HTMLInputElement;
        await act(async () => {
            fireEvent.change(zoomInput, { target: { value: '2' } });
        });
        expect(zoomInput.value).toBe('2');

        vi.unstubAllGlobals();
    });

    it('handles action success then clear message', async () => {
        (api.post as Mock).mockResolvedValue({});

        render(<ProfilePage />);
        fireEvent.click(screen.getByText('Segurança'));
        fireEvent.click(screen.getByText('Solicitar Redefinição'));

        await waitFor(() => {
            expect(screen.getByText('Link de redefinição enviado!')).toBeInTheDocument();
        }, { timeout: 4000 });

        // Wait for it to disappear naturally in the test
        await waitFor(() => {
            expect(screen.queryByText('Link de redefinição enviado!')).not.toBeInTheDocument();
        }, { timeout: 6000 });
    });
});
