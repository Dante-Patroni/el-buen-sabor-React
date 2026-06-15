import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const AccesoDenegado = () => {
  return (
    <EmptyState
      className="min-h-[400px]"
      icon={
        <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
          <Lock className="w-12 h-12" />
        </div>
      }
      title="Acceso Denegado"
      description="No tenés los permisos necesarios para acceder a esta sección. Si creés que esto es un error, contactá al administrador."
      action={
        <Link
          to="/"
          className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition"
        >
          Volver al inicio
        </Link>
      }
    />
  );
};
