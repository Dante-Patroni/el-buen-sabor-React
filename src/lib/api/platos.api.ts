import { authFetch } from "@/lib/authFetch";
import { extractRubroId } from "@/lib/utils";
import type { Plato } from "@/types";

export const getPlatos = async (): Promise<Plato[]> => {
  const res = await authFetch("/api/platos");
  if (!res.ok) throw new Error("Error al cargar los platos");
  const platos = await res.json();
  if (!Array.isArray(platos)) return platos;
  return platos.map((plato: Plato) => ({ ...plato, rubroId: extractRubroId(plato) ?? plato.rubroId }));
};

export const getPlato = async (id: string | number): Promise<Plato> => {
  const res = await authFetch(`/api/platos/${id}`);
  if (!res.ok) {
    const text = await res.text();
    console.error("BACKEND ERROR:", text);
    throw new Error("Error al cargar el plato");
  }
  const plato = await res.json();
  return { ...plato, rubroId: extractRubroId(plato) ?? plato.rubroId };
};

export const createPlato = async (payload: Record<string, unknown>): Promise<Response> => {
  return authFetch("/api/platos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const updatePlato = async (
  id: string | number,
  payload: Record<string, unknown>
): Promise<Response> => {
  return authFetch(`/api/platos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const uploadPlatoImagen = async (id: string | number, file: File): Promise<Response> => {
  const imgFormData = new FormData();
  imgFormData.append("imagen", file);
  return authFetch(`/api/platos/${id}/imagen`, {
    method: "POST",
    body: imgFormData,
  });
};
