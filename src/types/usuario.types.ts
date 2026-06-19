export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

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
