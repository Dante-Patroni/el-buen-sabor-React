import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

/**
 * @description Etiqueta tipo "pill" para estados/roles. El color se define via className
 * segun el significado (activo, inactivo, rol, etc.) para no alterar la logica existente.
 */
export const Badge = ({ className, children }: BadgeProps) => (
  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold uppercase", className)}>
    {children}
  </span>
);
