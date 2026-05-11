interface Props {
  label: string;
  icon: string;
  active?: boolean;
}

/**
 * @description Renderiza un item visual de navegacion para la sidebar del modulo cocina.
 * @param {Props} props - Propiedades del item con etiqueta, icono y estado activo.
 * @returns {JSX.Element} Item de sidebar estilizado.
 */
export const SidebarItem = ({ label, icon, active = false }: Props) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
        ${
          active
            ? "bg-[#ffb380] dark:bg-stone-800 text-orange-900 dark:text-orange-400 font-bold shadow-sm"
            : "text-stone-600 dark:text-stone-400 hover:text-orange-800 hover:bg-[#ffb380]"
        }
      `}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
};
