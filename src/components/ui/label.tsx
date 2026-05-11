import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @description Renderiza una etiqueta de formulario con estilos del sistema de UI.
 * @param {React.ComponentProps<"label">} props - Propiedades HTML de la etiqueta.
 * @returns {JSX.Element} Label estilizado.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
