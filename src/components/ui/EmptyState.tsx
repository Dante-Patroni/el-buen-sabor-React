import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * @description Estado vacio de pagina completa (icono + titulo + descripcion + accion opcional),
 * usado en pantallas de error, acceso denegado o secciones aun no disponibles.
 */
export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center h-full p-6 text-center", className)}>
    {icon}
    <h2 className="text-2xl font-bold text-stone-900 mb-2">{title}</h2>
    {description && (
      <p className="text-stone-600 max-w-md mb-6">{description}</p>
    )}
    {action}
  </div>
);
