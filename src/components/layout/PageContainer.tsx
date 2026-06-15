import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * @description Contenedor estandar de pagina con el padding base (p-6), reemplaza el
 * `<div className="p-6">` repetido al inicio de cada pantalla.
 */
export const PageContainer = ({ children, className }: PageContainerProps) => (
  <div className={cn("p-6", className)}>{children}</div>
);
