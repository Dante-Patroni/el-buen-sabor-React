import { useState, useEffect } from "react";
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-yellow-700 mb-6">Configuración</h1>
      <div className="bg-white p-6 rounded-xl shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4">Apariencia</h2>
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
    </div>
  );
};