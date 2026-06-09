import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from "./types";
import { authFetch } from "@/lib/authFetch";


/**
 * @description Realiza login contra el backend y devuelve JWT + usuario.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await authFetch(`/api/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Error de conexión" }));

    throw new Error(error.error || "Credenciales inválidas");
  }

  return response.json();
}

/**
 * @description Guarda token y usuario autenticado en localStorage.
 */
export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem("token", token);

  localStorage.setItem("user", JSON.stringify(user));

  // Notificar al resto de la app que la sesión cambió
  window.dispatchEvent(new Event("authChange"));
}

/**
 * @description Obtiene el token JWT almacenado.
 */
export function getToken(): string | null {
  return localStorage.getItem("token");
}
/**
 * @description Obtiene el usuario autenticado desde localStorage.
 * @returns Usuario autenticado o null.
 */
export const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

/**
 * @description Obtiene el usuario autenticado desde localStorage.
 */
export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * @description Verifica si existe token almacenado.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * @description Elimina la sesión del usuario.
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authChange"));
}

/**
 * @description Genera headers autenticados para fetch.
 */
export function authHeaders(): HeadersInit {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}