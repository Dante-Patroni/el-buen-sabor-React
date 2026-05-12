import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AuthUser } from "./types";

import {
  getStoredUser,
  isAuthenticated as checkIsAuthenticated,
  logout as logoutService,
} from "./authService";

/**
 * @description Valores compartidos por el contexto de autenticación.
 */
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

/**
 * @description Contexto global de autenticación.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * @description Provider global de autenticación.
 */
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  /**
   * Estado inicial leído desde localStorage.
   * Permite mantener sesión al refrescar.
   */
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredUser();
  });

  /**
   * Determina si existe sesión autenticada.
   */
  const isAuthenticated =
    !!user && checkIsAuthenticated();

  /**
   * Cierra sesión globalmente.
   */
  const logout = () => {
    logoutService();

    setUser(null);
  };

  /**
   * Memoriza el valor del contexto.
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      logout,
    }),
    [user, isAuthenticated],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @description Hook para consumir el contexto de autenticación.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider",
    );
  }

  return context;
}