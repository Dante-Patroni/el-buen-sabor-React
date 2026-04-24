interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "warning" | "dark";
  active?: boolean;
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  active = false,
}: ButtonProps) => {
  const base = "px-3 py-1 rounded font-medium transition"; // 👈 sacamos w-full para filtros

  const variants = {
    primary: active
      ? "bg-gray-800 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",

    success: active
      ? "bg-green-600 text-white"
      : "bg-green-200 text-green-800 hover:bg-green-300",

    warning: active
      ? "bg-orange-500 text-white"
      : "bg-orange-200 text-orange-800 hover:bg-orange-300",

    dark: active
      ? "bg-gray-900 text-white"
      : "bg-gray-300 text-gray-800 hover:bg-gray-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};