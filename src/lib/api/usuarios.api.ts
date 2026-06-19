import { authFetch } from "@/lib/authFetch";
import type { Usuario } from "@/types";

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await authFetch("/api/usuarios");
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
};

export const getUsuario = async (id: string | number): Promise<Usuario> => {
  const res = await authFetch(`/api/usuarios/${id}`);
  if (!res.ok) throw new Error("Error al cargar usuario");
  return res.json();
};

export const createUsuario = async (payload: Record<string, unknown>): Promise<Response> => {
  return authFetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const updateUsuario = async (
  id: string | number,
  payload: Record<string, unknown>
): Promise<Response> => {
  return authFetch(`/api/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const deleteUsuario = async (id: string | number): Promise<Response> => {
  return authFetch(`/api/usuarios/${id}`, { method: "DELETE" });
};
