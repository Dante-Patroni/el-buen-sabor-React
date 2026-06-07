/**
 * Representa una categoría de menú (ej. Entradas, Platos Principales).
 * Puede tener subcategorías (subrubros) para una organización jerárquica.
 */
export interface Rubro {
  /** Identificador único del rubro */
  id: number;
  /** Nombre descriptivo de la categoría */
  denominacion: string;
  /** Lista de subcategorías opcionales */
  subrubros?: Rubro[];
}

/**
 * Representa un plato del menú del restaurante.
 * Incluye información de precio, stock, categoría y disponibilidad.
 */
export interface Plato {
  /** Identificador único del plato */
  id: number;
  /** Nombre del plato */
  nombre: string;
  /** Descripción detallada */
  descripcion: string;
  /** Indica si es parte del menú del día */
  esMenuDelDia: boolean;
  /** Indica si el stock es ilimitado */
  esIlimitado: boolean;
  /** Precio actual del plato */
  precio: number;
  /** Cantidad disponible en stock */
  stockActual: number;
  /** Indica si el plato está activo y visible para los clientes */
  esActivo: boolean;
  /** Ruta relativa de la imagen del plato */
  imagenPath: string | null;
  /** ID del rubro/categoría al que pertenece */
  rubroId: number;
  /** Objeto rubro expandido (puede venir del backend) */
  rubro?: {
    id?: number;
    denominacion: string;
  };
  /** Variante en mayúsculas del rubro expandido (algunos endpoints) */
  Rubro?: {
    id?: number;
    denominacion: string;
  };
  /** Fecha de creación del registro */
  createdAt?: string;
}

/**
 * Representa un Rol en el sistema RBAC.
 */
export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

/**
 * Representa un Usuario del sistema.
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
  rolId: number;
  rol?: string;
  permisos?: string[];
  activo: boolean;
}
