import { createBrowserRouter } from "react-router-dom";
import { redirect } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CocinaPage } from "../pages/Cocina/CocinaPage";
import { PlatosPage } from "../pages/Cocina/PlatosPage";
import { PlatoFormPage } from "../pages/Cocina/PlatoFormPage";

const extractRubroId = (plato: any) =>
  plato?.rubroId ??
  plato?.RubroId ??
  plato?.rubro_id ??
  plato?.rubro?.id ??
  plato?.Rubro?.id ??
  null;

const platosLoader = async () => {
  const res = await fetch("http://localhost:3000/api/platos");

  if (!res.ok) {
    throw new Error("Error al cargar los platos");
  }

  const platos = await res.json();

  if (!Array.isArray(platos)) return platos;

  return platos.map((plato) => ({
    ...plato,
    rubroId: extractRubroId(plato),
  }));
};

const platoLoader = async ({ params }: any) => {
  console.log("PARAMS:", params);

  const res = await fetch(`http://localhost:3000/api/platos/${params.id}`);

  console.log("STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("BACKEND ERROR:", text);
    throw new Error("Error al cargar el plato");
  }

  const plato = await res.json();

  // Normaliza la forma para el frontend:
  // algunos endpoints devuelven rubroId y otros rubro.id.
  return {
    ...plato,
    rubroId: extractRubroId(plato),
  };
};

// Action de ejemplo para crear un plato
const crearPlatoAction = async ({ request }: any) => {
  const formData = await request.formData();

  const esIlimitado = formData.get("esIlimitado") === "on";

  const payload = {
    nombre: formData.get("nombre"),
    precio: Number(formData.get("precio")),
    descripcion: formData.get("descripcion"),
    rubroId: Number(formData.get("rubroId")),
    esIlimitado,
    esMenuDelDia: formData.get("esMenuDelDia") === "on",
    stockActual: esIlimitado
      ? null
      : Number(formData.get("stockActual")),
  };

  try {
    const res = await fetch("http://localhost:3000/api/platos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Error al crear plato");
    }

    const data = await res.json();
    console.log("CREADO:", data);

    // 👉 REDIRECCIÓN (MUY IMPORTANTE)
    return redirect("/cocina/platos");

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const router = createBrowserRouter([
  {
    // Ruta padre sin path → actúa como layout compartido
    element: <AppLayout />,
    children: [
      { path: "/", element: <CocinaPage /> },
      { path: "/cocina", element: <CocinaPage /> },
      { path: "/cocina/platos", element: <PlatosPage />, loader: platosLoader },
      { path: "/cocina/platos/nuevo", element: <PlatoFormPage />, action: crearPlatoAction },
      {
        path: "/cocina/platos/:id",
        element: <PlatoFormPage />,
        loader: platoLoader,
      }
    ],
  },
]);