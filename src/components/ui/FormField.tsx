import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const FIELD_STYLES =
  "w-full rounded-xl border border-stone-300 bg-stone-50 p-3 focus:border-red-800 focus:outline-none";

const LABEL_STYLES = "text-xs font-semibold uppercase tracking-wider text-stone-500";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
}

/**
 * @description Campo de formulario (label + input) con el estilo estandar usado en los
 * formularios de administracion. El asterisco de "requerido" se incluye en el label si
 * la prop `required` esta presente.
 */
export const FormField = ({ label, className, id, required, ...props }: FormFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className={LABEL_STYLES}>
      {label}
      {required && " *"}
    </label>
    <input id={id} required={required} className={cn(FIELD_STYLES, className)} {...props} />
  </div>
);

interface FormSelectProps extends React.ComponentProps<"select"> {
  label: string;
  children: ReactNode;
}

/**
 * @description Select de formulario (label + select) con el mismo estilo que FormField.
 */
export const FormSelect = ({ label, className, id, required, children, ...props }: FormSelectProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className={LABEL_STYLES}>
      {label}
      {required && " *"}
    </label>
    <select id={id} required={required} className={cn(FIELD_STYLES, className)} {...props}>
      {children}
    </select>
  </div>
);

export { FIELD_STYLES, LABEL_STYLES };
