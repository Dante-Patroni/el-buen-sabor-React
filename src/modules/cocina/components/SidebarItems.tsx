interface Props {
  label: string;
  icon: string;
  active?: boolean;
}

export const SidebarItem = ({ label, icon, active = false }: Props) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
        ${
          active
            ? "bg-white dark:bg-stone-800 text-orange-900 dark:text-orange-400 font-bold shadow-sm"
            : "text-stone-600 dark:text-stone-400 hover:text-orange-800 hover:bg-white/50"
        }
      `}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
};