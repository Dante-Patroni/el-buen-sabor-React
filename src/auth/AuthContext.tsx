import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
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
  tienePermiso: (codigo: string) => boolean;
  tieneAlgunPermiso: (...codigos: string[]) => boolean;
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

  console.log("USER AUTH:", user);
  console.log("ROL:", user?.rol);
  console.log("PERMISOS:", user?.permisos);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

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

  const tienePermiso = useCallback(
    (codigo: string) => user?.permisos?.includes(codigo) ?? false,
    [user]
  );

  const tieneAlgunPermiso = useCallback(
    (...codigos: string[]) => codigos.some((c) => user?.permisos?.includes(c) ?? false),
    [user]
  );

  /**
   * Memoriza el valor del contexto.
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      logout,
      tienePermiso,
      tieneAlgunPermiso,
    }),
    [user, isAuthenticated, tienePermiso, tieneAlgunPermiso],
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