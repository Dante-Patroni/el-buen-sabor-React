import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="bg-yellow-700/20 flex-1 ml-64 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};