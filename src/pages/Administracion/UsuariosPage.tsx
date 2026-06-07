import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import type { Usuario } from "../../types";
import { authFetch } from "@/lib/authFetch";
import { RequirePermiso } from "@/auth/RequirePermiso";
import { USUARIO_CREAR, USUARIO_MODIFICAR, USUARIO_ELIMINAR } from "@/auth/permisos";

export const UsuariosPage = () => {
  const navigate = useNavigate();
  const initialUsuarios = useLoaderData() as Usuario[];
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchEstado =
      !estadoFiltro ||
      (estadoFiltro === "activo" && u.activo) ||
      (estadoFiltro === "inactivo" && !u.activo);
    return matchEstado;
  });

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que querés dar de baja este usuario?")) return;

    try {
      const res = await authFetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo dar de baja el usuario");
      }

      setUsuarios(usuarios.map(u => u.id === id ? { ...u, activo: false } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-yellow-700">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-500">
            Administra los usuarios del sistema y sus roles.
          </p>
        </div>

        <div className="w-52">
          <RequirePermiso permisos={[USUARIO_CREAR]}>
            <Button
              onClick={() => navigate("/administracion/usuarios/nuevo")}
              variant="destructive"
            >
              Nuevo Usuario
            </Button>
          </RequirePermiso>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <select
          className="border border-stone-300 rounded p-2"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Cualquier estado</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 px-4">Legajo</th>
              <th className="py-2 px-4">Nombre y Apellido</th>
              <th className="py-2 px-4">Rol</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-4">{usuario.legajo}</td>
                <td className="px-4 py-4 font-medium text-stone-900">
                  {usuario.nombre} {usuario.apellido}
                </td>
                <td className="px-4 py-4">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold uppercase">
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                      usuario.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <RequirePermiso permisos={[USUARIO_MODIFICAR]}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/administracion/usuarios/${usuario.id}`)}
                      >
                        Editar
                      </Button>
                    </RequirePermiso>
                    <RequirePermiso permisos={[USUARIO_ELIMINAR]}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEliminar(usuario.id)}
                        disabled={!usuario.activo}
                      >
                        Baja
                      </Button>
                    </RequirePermiso>
                  </div>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
