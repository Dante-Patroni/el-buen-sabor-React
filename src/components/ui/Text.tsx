import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextProps {
  className?: string;
  children: ReactNode;
}

/**
 * @description Parrafo de texto secundario con el estilo estandar (subtitulos, descripciones).
 */
export const Text = ({ className, children }: TextProps) => (
  <p className={cn("text-sm text-stone-600", className)}>{children}</p>
);
