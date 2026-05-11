import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

/**
 * @description Renderiza el layout principal con sidebar fija y area de contenido para rutas hijas.
 * @returns {JSX.Element} Estructura base de la aplicacion con Outlet de React Router.
 */
export const AppLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fija a la izquierda */}
      <Sidebar />

      {/* Area de contenido con scroll independiente */}
      <div className="bg-yellow-700/20 flex-1 ml-64 flex flex-col h-full overflow-auto">
        {/* Outlet renderiza el componente de la ruta activa */}
        <Outlet />
      </div>
    </div>
  );
};
