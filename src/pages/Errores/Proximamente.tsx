import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * @description Renderiza una pantalla temporal para rutas o funcionalidades todavia no implementadas.
 * @returns {JSX.Element} Pagina de funcionalidad en desarrollo.
 */
export const Proximamente = () => {
  return (
    <EmptyState
      title="Próximamente"
      description="Esta funcionalidad está en desarrollo."
      action={
        <Link
          to="/"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Volver al inicio
        </Link>
      }
    />
  );
};
