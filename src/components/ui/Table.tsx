import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: ReactNode;
  className?: string;
}

/**
 * @description Contenedor de tabla con scroll horizontal y estilos base, para listados administrativos.
 */
export const Table = ({ children, className }: TableProps) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full text-left", className)}>{children}</table>
  </div>
);

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

/**
 * @description Encabezado de tabla (thead) con la tipografia estandar de columnas.
 */
export const TableHead = ({ children, className }: TableHeadProps) => (
  <thead>
    <tr
      className={cn(
        "border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-stone-500",
        className
      )}
    >
      {children}
    </tr>
  </thead>
);

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * @description Fila de tabla (tr) con hover y separador estandar. Acepta onClick opcional para filas navegables.
 */
export const TableRow = ({ children, className, onClick }: TableRowProps) => (
  <tr
    onClick={onClick}
    className={cn(
      "border-b border-stone-100 transition hover:bg-stone-50 last:border-b-0",
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </tr>
);

interface TableEmptyRowProps {
  colSpan: number;
  message: string;
}

/**
 * @description Fila que indica que no hay resultados, ocupando todas las columnas de la tabla.
 */
export const TableEmptyRow = ({ colSpan, message }: TableEmptyRowProps) => (
  <tr>
    <td colSpan={colSpan} className="py-10 text-center text-stone-500">
      {message}
    </td>
  </tr>
);
