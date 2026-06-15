import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  className?: string;
}

/**
 * @description Indicador de carga con icono giratorio y mensaje, para reemplazar los "Cargando..." repetidos.
 */
export const Loading = ({ label = "Cargando...", className }: LoadingProps) => (
  <div className={cn("flex items-center gap-3 text-stone-500", className)}>
    <span className="material-symbols-outlined animate-spin">sync</span>
    <span>{label}</span>
  </div>
);
