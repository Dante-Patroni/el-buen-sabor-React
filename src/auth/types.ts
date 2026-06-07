/**
 * @description Credenciales enviadas al backend para autenticación.
 */
export interface LoginCredentials {
  legajo: string;
  password: string;
}

/**
 * @description Usuario autenticado devuelto por el backend.
 */
export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
  rolId: number;
  rol: string;
  permisos: string[];
  activo: boolean;
}

/**
 * @description Respuesta del endpoint de login.
 */
export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

/**
 * @description Estado global de autenticación.
 */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}