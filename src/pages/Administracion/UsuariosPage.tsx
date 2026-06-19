import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/input";
import type { Usuario } from "../../types";
import { deleteUsuario } from "@/lib/api/usuarios.api";
import { RequirePermiso } from "@/auth/RequirePermiso";
import { USUARIO_CREAR } from "@/auth/permisos";
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UsuariosTable } from "@/components/Administracion/UsuariosTable";

const PAGE_SIZE = 8;

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
      const res = await deleteUsuario(id);
      if (!res.ok) throw new Error("No se pudo dar de baja el usuario");
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
              <Input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar por nombre o legajo..."
                className="rounded-xl border-stone-300 bg-stone-50 py-2.5 pl-9 pr-3 h-auto focus:border-orange-500"
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
                  <Button
                    key={rol}
                    type="button"
                    variant="outline"
                    onClick={() => toggleRol(rol)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium capitalize",
                      seleccionado
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    )}
                  >
                    {rol}
                  </Button>
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

          <Button
            type="button"
            variant="outline"
            onClick={limpiarFiltros}
            className="w-full rounded-xl"
          >
            Limpiar Filtros
          </Button>
        </aside>

        <main className="rounded-3xl border border-stone-200 bg-white shadow-sm">
          <UsuariosTable
            usuarios={usuariosPagina}
            onEditar={(id) => navigate(`/administracion/usuarios/${id}`)}
            onEliminar={handleEliminar}
          />

          <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Mostrando {usuariosPagina.length} de {usuariosFiltrados.length} usuarios
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="size-8 rounded-xl"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={n === paginaActual ? "default" : "outline"}
                  onClick={() => setPagina(n)}
                  className={cn(
                    "size-8 rounded-xl text-sm font-semibold",
                    n === paginaActual && "bg-red-800 text-white hover:bg-red-900"
                  )}
                >
                  {n}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="size-8 rounded-xl"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
