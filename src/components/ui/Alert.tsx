import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success";

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

/**
 * @description Mensaje de error o exito con estilo unificado para formularios y listados.
 */
export const Alert = ({ variant = "error", className, children }: AlertProps) => (
  <div
    className={cn(
      "rounded-2xl border px-4 py-3 text-sm",
      VARIANT_STYLES[variant],
      className
    )}
  >
    {children}
  </div>
);
