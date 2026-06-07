import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/**
 * @description Props del componente guard de permisos.
 */
interface RequirePermisoProps {
  /** Códigos de permiso — el usuario debe tener AL MENOS UNO. */
  permisos: string[];
  /** Contenido a renderizar si tiene permiso. */
  children: ReactNode;
  /** Contenido alternativo si NO tiene permiso (default: null). */
  fallback?: ReactNode;
}

/**
 * @description Componente guard que renderiza sus hijos solo si el usuario
 * posee al menos uno de los permisos indicados.
 *
 * @example
 * // Ocultar un botón:
 * <RequirePermiso permisos={[PLATO_CREAR]}>
 *   <Button>Agregar Plato</Button>
 * </RequirePermiso>
 *
 * @example
 * // Proteger una ruta con fallback:
 * <RequirePermiso permisos={[MESA_VER]} fallback={<AccesoDenegado />}>
 *   <CajaPage />
 * </RequirePermiso>
 */
export const RequirePermiso = ({
  permisos,
  children,
  fallback = null,
}: RequirePermisoProps) => {
  const { tieneAlgunPermiso } = useAuth();

  if (!tieneAlgunPermiso(...permisos)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
