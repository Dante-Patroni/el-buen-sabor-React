import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

/**
 * Layout principal de la aplicación.
 * Renderiza la barra lateral fija y el área de contenido dinámico.
 * Actúa como contenedor padre para todas las rutas del router.
 */
export const AppLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fija a la izquierda */}
      <Sidebar />

      {/* Área de contenido con scroll independiente */}
      <div className="bg-yellow-700/20 flex-1 ml-64 flex flex-col h-full overflow-auto">
        {/* Outlet renderiza el componente de la ruta activa */}
        <Outlet />
      </div>
    </div>
  );
};
