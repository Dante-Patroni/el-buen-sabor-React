import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export const AccesoDenegado = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
        <Lock className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Acceso Denegado</h2>
      <p className="text-stone-600 max-w-md mb-6">
        No tenés los permisos necesarios para acceder a esta sección. Si creés que esto es un error, contactá al administrador.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
};
