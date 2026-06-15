import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

/**
 * @description Renderiza un mensaje de error para errores de rutas y excepciones inesperadas.
 * @returns {JSX.Element} Pagina de error asociada al router.
 */
export const ErrorPage = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold text-red-600">Error {error.status}</h1>
        <p className="text-gray-600 mt-2">{error.statusText}</p>
        {error.data && <pre className="mt-4 bg-gray-100 p-4 rounded">{error.data}</pre>}
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-red-600">Error inesperado</h1>
      <p className="text-gray-600 mt-2">
        {error instanceof Error ? error.message : "Algo salió mal"}
      </p>
    </PageContainer>
  );
};
