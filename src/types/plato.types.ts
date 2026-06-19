export interface Rubro {
  id: number;
  denominacion: string;
  subrubros?: Rubro[];
}

export interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  esMenuDelDia: boolean;
  esIlimitado: boolean;
  precio: number;
  stockActual: number;
  esActivo: boolean;
  imagenPath: string | null;
  rubroId: number;
  rubro?: { id?: number; denominacion: string };
  Rubro?: { id?: number; denominacion: string };
  createdAt?: string;
}
