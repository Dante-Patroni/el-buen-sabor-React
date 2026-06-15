import { cn } from "@/lib/utils";

interface SelectProps extends React.ComponentProps<"select"> {}

/**
 * @description Select estilizado sin label, usado en filtros y barras de herramientas.
 */
export const Select = ({ className, ...props }: SelectProps) => (
  <select
    className={cn(
      "rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:border-red-800 focus:outline-none",
      className
    )}
    {...props}
  />
);
