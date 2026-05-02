import { createBrowserRouter, redirect } from "react-router-dom";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CocinaPage } from "../pages/Cocina/CocinaPage";
import { PlatosPage } from "../pages/Cocina/PlatosPage";
import { PlatoFormPage } from "../pages/Cocina/PlatoFormPage";
import { extractRubroId } from "@/lib/utils";
import { ErrorPage } from "../pages/Errores/ErrorPage";
import { ConfigPage } from "../pages/Configuracion/ConfigPage";
import { Proximamente } from "../pages/Errores/Proximamente";

const API_URL = import.meta.env.VITE_API_URL;

const platosLoader = async () => {
  const res = await fetch(`${API_URL}/api/platos`);
  if (!res.ok) throw new Error("Error al cargar los platos");
  const platos = await res.json();
  if (!Array.isArray(platos)) return platos;
  return platos.map((plato: any) => ({
    ...plato,
    rubroId: extractRubroId(plato),
  }));
};

const platoLoader = async ({ params }: LoaderFunctionArgs) => {
  const res = await fetch(`${API_URL}/api/platos/${params.id}`);
  if (!res.ok) {
    const text = await res.text();
    console.error("BACKEND ERROR:", text);
    throw new Error("Error al cargar el plato");
  }
  const plato = await res.json();
  return {
    ...plato,
    rubroId: extractRubroId(plato),
  };
};

const editarPlatoAction = async ({ request, params }: ActionFunctionArgs) => {
  const id = params.id!;
  const formData = await request.formData();
  
  console.log("=== EDITAR PLATO ===");
  console.log("ID:", id);
  
  const esIlimitado = formData.get("esIlimitado") === "on";
  
  const payload = {
    nombre: formData.get("nombre"),
    precio: Number(formData.get("precio")),
    descripcion: formData.get("descripcion"),
    rubroId: Number(formData.get("rubroId")),
    esIlimitado,
    esMenuDelDia: formData.get("esMenuDelDia") === "on",
    esActivo: formData.get("esActivo") === "on",
    stockActual: esIlimitado ? null : Number(formData.get("stockActual")),
  };
  
  try {
    const res = await fetch(`${API_URL}/api/platos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error("Error al editar plato:", text);
      return { error: "Error al editar plato" };
    }
    
    const imagenFile = formData.get("imagen") as File | null;
    console.log("Imagen:", imagenFile?.name || "NINGUNA");
    
    if (imagenFile && imagenFile.size > 0) {
      const imgFormData = new FormData();
      imgFormData.append("imagen", imagenFile);
      
      const imgRes = await fetch(`${API_URL}/api/platos/${id}/imagen`, {
        method: "POST",
        body: imgFormData,
      });
      
      if (!imgRes.ok) {
        console.error("ERROR IMG:", await imgRes.text());
      } else {
        const data = await imgRes.json();
        console.log("IMG OK:", data);
      }
    }
    
    return redirect("/cocina/platos");
  } catch (error) {
    console.error("Error en editarPlatoAction:", error);
    return { error: "Error en el proceso" };
  }
};

const crearPlatoAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  console.log("=== CREAR PLATO ===");
  
  if (!formData.get("nombre")) {
    return { error: "El nombre es obligatorio" };
  }
  
  const esIlimitado = formData.get("esIlimitado") === "on";
  
  const payload = {
    nombre: formData.get("nombre"),
    precio: Number(formData.get("precio")),
    descripcion: formData.get("descripcion"),
    rubroId: Number(formData.get("rubroId")),
    esIlimitado,
    esMenuDelDia: formData.get("esMenuDelDia") === "on",
    esActivo: formData.get("esActivo") === "on",
    stockActual: esIlimitado ? null : Number(formData.get("stockActual")),
  };
  
  try {
    const res = await fetch(`${API_URL}/api/platos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error("Error al crear plato:", text);
      return { error: "Error al crear plato" };
    }
    
    const nuevoPlato = await res.json();
    console.log("Plato creado con ID:", nuevoPlato.id);
    
    const imagenFile = formData.get("imagen") as File | null;
    console.log("Imagen:", imagenFile?.name || "NINGUNA");
    
    if (imagenFile && imagenFile.size > 0) {
      const imgFormData = new FormData();
      imgFormData.append("imagen", imagenFile);
      
      const imgRes = await fetch(`${API_URL}/api/platos/${nuevoPlato.id}/imagen`, {
        method: "POST",
        body: imgFormData,
      });
      
      if (!imgRes.ok) {
        console.error("ERROR IMG:", await imgRes.text());
      } else {
        const data = await imgRes.json();
        console.log("IMG OK:", data);
      }
    }
    
    return redirect("/cocina/platos");
  } catch (error) {
    console.error("Error en crearPlatoAction:", error);
    return { error: "Error al crear plato" };
  }
};

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <CocinaPage /> },
      { path: "/cocina", element: <CocinaPage /> },
      { path: "/cocina/platos", element: <PlatosPage />, loader: platosLoader, errorElement: <ErrorPage /> },
      { path: "/cocina/platos/nuevo", element: <PlatoFormPage />, action: crearPlatoAction, errorElement: <ErrorPage /> },
      { path: "/configuracion", element: <ConfigPage /> },
      { path: "/login", element: <Proximamente /> },
      {
        path: "/cocina/platos/:id",
        element: <PlatoFormPage />,
        loader: platoLoader,
        action: editarPlatoAction,
        errorElement: <ErrorPage />,
      }
    ],
  },
]);
