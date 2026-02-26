export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    photoUrl?: string;
    googleId?: string;
    document?: string;
}

export interface LoginResponse {
    token: string;
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    photoUrl?: string;
    googleId?: string;
    document?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
