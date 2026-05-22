export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface PublicLoginRequest {
  email: string;
  password: string;
}

export interface PublicRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface PublicLoginResponse {
  name: string;
  token: string;
}

export interface PublicRegisterResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}
