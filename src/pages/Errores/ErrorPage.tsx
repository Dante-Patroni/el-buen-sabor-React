import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);

  const titulo = isRouteError ? `Error ${error.status}` : "Error inesperado";
  const mensaje = isRouteError
    ? error.statusText
    : error instanceof Error ? error.message : "Algo salió mal";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600">{titulo}</h1>
      {mensaje && <p className="text-gray-600 mt-2">{mensaje}</p>}
      {isRouteError && error.data && (
        <pre className="mt-4 bg-gray-100 p-4 rounded">{error.data}</pre>
      )}
    </div>
  );
};
