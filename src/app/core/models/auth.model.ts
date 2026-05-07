export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  jwt: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'superadmin';
  exp: number;
  iat: number;
}
