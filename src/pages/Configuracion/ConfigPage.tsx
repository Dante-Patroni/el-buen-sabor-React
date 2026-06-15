import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";

/**
 * @description Renderiza la pagina de configuracion y permite alternar el modo oscuro persistido.
 * @returns {JSX.Element} Pagina de configuracion de apariencia.
 */
export const ConfigPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);
  return (
    <PageContainer>
      <Heading as="h1" className="mb-6">Configuración</Heading>
      <div className="bg-white p-6 rounded-xl shadow max-w-md">
        <Heading as="h3" className="mb-4">Apariencia</Heading>
        <div className="flex items-center justify-between">
          <span>Modo oscuro</span>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 rounded-full relative transition ${
              darkMode ? "bg-orange-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                darkMode ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
