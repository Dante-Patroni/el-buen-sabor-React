import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import type { Usuario } from "../../types";
import { authFetch } from "@/lib/authFetch";
import { RequirePermiso } from "@/auth/RequirePermiso";
import { USUARIO_CREAR, USUARIO_MODIFICAR, USUARIO_ELIMINAR } from "@/auth/permisos";
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 8;

const ROL_BADGE_STYLES: Record<string, string> = {
  admin: "bg-orange-100 text-orange-700",
  superadmin: "bg-stone-800 text-white",
  cocinero: "bg-stone-200 text-stone-700",
  mozo: "bg-rose-100 text-rose-700",
  cajero: "bg-amber-100 text-amber-700",
};

const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

export const UsuariosPage = () => {
  const navigate = useNavigate();
  const initialUsuarios = useLoaderData() as Usuario[];
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [busqueda, setBusqueda] = useState("");
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([]);
  const [soloActivos, setSoloActivos] = useState(false);
  const [soloInactivos, setSoloInactivos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const rolesDisponibles = Array.from(
    new Set(usuarios.map((u) => u.rol).filter((r): r is string => !!r))
  );

  const toggleRol = (rol: string) => {
    setPagina(1);
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setRolesSeleccionados([]);
    setSoloActivos(false);
    setSoloInactivos(false);
    setPagina(1);
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.legajo}`.toLowerCase();
    const matchBusqueda = !busqueda || texto.includes(busqueda.toLowerCase());
    const matchRol =
      rolesSeleccionados.length === 0 || (!!u.rol && rolesSeleccionados.includes(u.rol));
    const matchEstado =
      (!soloActivos && !soloInactivos) ||
      (soloActivos && u.activo) ||
      (soloInactivos && !u.activo);
    return matchBusqueda && matchRol && matchEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const usuariosPagina = usuariosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Gestión de Usuarios</h1>
          <p className="text-sm text-stone-600">
            Control y administración del personal del restaurante.
          </p>
        </div>

        <RequirePermiso permisos={[USUARIO_CREAR]}>
          <Button
            onClick={() => navigate("/administracion/usuarios/nuevo")}
            className="rounded-2xl bg-red-800 px-5 py-3 text-white hover:bg-red-900"
          >
            <UserPlus className="size-4" />
            Agregar Usuario
          </Button>
        </RequirePermiso>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar por nombre o legajo..."
                className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              Rol del usuario
            </p>
            <div className="grid grid-cols-2 gap-2">
              {rolesDisponibles.map((rol) => {
                const seleccionado = rolesSeleccionados.includes(rol);
                return (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => toggleRol(rol)}
                    className={
                      "rounded-xl border px-3 py-2 text-sm font-medium capitalize transition " +
                      (seleccionado
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300")
                    }
                  >
                    {rol}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              Estado
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={soloActivos}
                  onChange={(e) => {
                    setSoloActivos(e.target.checked);
                    setPagina(1);
                  }}
                  className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                Activos
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={soloInactivos}
                  onChange={(e) => {
                    setSoloInactivos(e.target.checked);
                    setPagina(1);
                  }}
                  className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                Inactivos
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="w-full rounded-xl bg-stone-100 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
          >
            Limpiar Filtros
          </button>
        </aside>

        <main className="rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-4">Nombre y Apellido</th>
                  <th className="px-5 py-4">Legajo</th>
                  <th className="px-5 py-4">Rol</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-stone-100 transition hover:bg-stone-50 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600">
                          {getInitials(usuario.nombre, usuario.apellido)}
                        </div>
                        <span className="font-medium text-stone-900">
                          {usuario.nombre} {usuario.apellido}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">#{usuario.legajo}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                          ROL_BADGE_STYLES[usuario.rol ?? ""] ?? "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                          usuario.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
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
                {usuariosPagina.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-stone-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Mostrando {usuariosPagina.length} de {usuariosFiltrados.length} usuarios
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="flex size-8 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPagina(n)}
                  className={
                    "flex size-8 items-center justify-center rounded-xl text-sm font-semibold transition " +
                    (n === paginaActual
                      ? "bg-red-800 text-white"
                      : "border border-stone-200 text-stone-600 hover:bg-stone-50")
                  }
                >
                  {n}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="flex size-8 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
