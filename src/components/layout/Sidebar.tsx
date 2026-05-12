import { Link } from "react-router-dom";

/**
 * @description Renderiza la barra lateral de navegacion principal con accesos de modulo y configuracion.
 * @returns {JSX.Element} Sidebar fija de la aplicacion.
 */
export const Sidebar = () => {
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-stone-100 dark:bg-stone-900 flex flex-col p-4 z-50">

            {/* LOGO */}
            <div className="mb-10 px-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">restaurant</span>
                </div>

                <div>
                    <h1 className="text-xl font-bold text-orange-900 dark:text-orange-500 leading-tight">
                        El Buen Sabor
                    </h1>
                    <p className="text-xs font-medium text-stone-500">
                        Gestión de Restaurante
                    </p>
                </div>
            </div>

            {/* NAV - Enlaces principales */}
            <nav className="flex-1 space-y-2">

                <Link to="/cocina" className="flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:text-orange-800 hover:bg-white/50 transition">
                    <span className="material-symbols-outlined">chef_hat</span>
                    <span className="text-sm font-medium">Monitor de Cocina</span>
                </Link>

                <Link to="/cocina/platos" className="flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:text-orange-800 hover:bg-white/50 transition">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    <span className="text-sm">Platos</span>
                </Link>

                {/* CONFIG y Logout */}
                <div className="mt-auto">
                    <Link
                        to="/configuracion"
                        className="flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:text-orange-800 hover:bg-white/50 transition"
                    >
                        <span className="material-symbols-outlined">
                            settings
                        </span>

                        <span className="text-sm font-medium">
                            Configuración
                        </span>
                    </Link>

                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");

                            window.location.href = "/login";
                        }}
                        className="flex w-full items-center gap-3 rounded px-4 py-3 text-red-600 hover:bg-red-100 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">
                            logout
                        </span>

                        <span className="text-sm font-medium">
                            Salir
                        </span>
                    </button>
                </div>

            </nav>
        </aside>
    );
};
