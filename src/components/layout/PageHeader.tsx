import type { ReactNode } from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * @description Encabezado de pagina (titulo + descripcion + accion opcional), alineado en fila en pantallas grandes.
 */
export const PageHeader = ({ title, description, action, className }: PageHeaderProps) => (
  <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
    <div>
      <Heading as="h1">{title}</Heading>
      {description && <Text className="mt-1">{description}</Text>}
    </div>
    {action}
  </div>
);
