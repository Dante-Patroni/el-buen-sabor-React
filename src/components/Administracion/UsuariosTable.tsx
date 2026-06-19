import { Button } from "@/components/ui/Button";
import { RequirePermiso } from "@/auth/RequirePermiso";
import { USUARIO_MODIFICAR, USUARIO_ELIMINAR } from "@/auth/permisos";
import { getRolBadgeClass } from "@/lib/mappings";
import type { Usuario } from "@/types";

const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
}

export const UsuariosTable = ({ usuarios, onEditar, onEliminar }: UsuariosTableProps) => (
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
        {usuarios.map((usuario) => (
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
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getRolBadgeClass(usuario.rol ?? "")}`}>
                {usuario.rol}
              </span>
            </td>
            <td className="px-5 py-4">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                  usuario.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {usuario.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex justify-end gap-2">
                <RequirePermiso permisos={[USUARIO_MODIFICAR]}>
                  <Button size="sm" variant="secondary" onClick={() => onEditar(usuario.id)}>
                    Editar
                  </Button>
                </RequirePermiso>
                <RequirePermiso permisos={[USUARIO_ELIMINAR]}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEliminar(usuario.id)}
                    disabled={!usuario.activo}
                  >
                    Baja
                  </Button>
                </RequirePermiso>
              </div>
            </td>
          </tr>
        ))}
        {usuarios.length === 0 && (
          <tr>
            <td colSpan={5} className="py-10 text-center text-stone-500">
              No se encontraron usuarios.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
