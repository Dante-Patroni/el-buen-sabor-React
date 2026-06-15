import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";

const LEVEL_STYLES: Record<HeadingLevel, string> = {
  h1: "text-3xl font-bold text-stone-900",
  h2: "text-2xl font-semibold text-stone-900",
  h3: "text-lg font-semibold text-stone-900",
};

interface HeadingProps {
  as?: HeadingLevel;
  className?: string;
  children: ReactNode;
}

/**
 * @description Titulo unificado (h1/h2/h3) con la tipografia y color estandar del sistema.
 */
export const Heading = ({ as = "h1", className, children }: HeadingProps) => {
  const Tag = as as ElementType;
  return <Tag className={cn(LEVEL_STYLES[as], className)}>{children}</Tag>;
};
