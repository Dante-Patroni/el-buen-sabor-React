import { Link } from "react-router-dom";
export const Proximamente = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h1 className="text-4xl font-bold text-yellow-700 mb-4">Próximamente</h1>
      <p className="text-gray-500 mb-6">
        Esta funcionalidad está en desarrollo.
      </p>
      <Link
        to="/"
        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
};