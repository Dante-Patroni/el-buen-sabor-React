import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import type { Usuario, Rol } from "../../types";

export const UsuarioFormPage = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { usuario, roles } = useLoaderData() as { usuario?: Usuario; roles: Rol[] };
  const actionData = useActionData() as { error?: string } | undefined;

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!usuario;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-stone-900">
          {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      <Form method={isEditing ? "put" : "post"} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        {actionData?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {actionData.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-semibold text-stone-700">
              Nombre *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={usuario?.nombre}
              required
              className="w-full rounded-lg border border-stone-300 p-3 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="apellido" className="text-sm font-semibold text-stone-700">
              Apellido *
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              defaultValue={usuario?.apellido}
              required
              className="w-full rounded-lg border border-stone-300 p-3 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="legajo" className="text-sm font-semibold text-stone-700">
              Legajo *
            </label>
            <input
              id="legajo"
              name="legajo"
              type="text"
              defaultValue={usuario?.legajo}
              required
              className="w-full rounded-lg border border-stone-300 p-3 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rolId" className="text-sm font-semibold text-stone-700">
              Rol *
            </label>
            <select
              id="rolId"
              name="rolId"
              defaultValue={usuario?.rolId}
              required
              className="w-full rounded-lg border border-stone-300 p-3 focus:border-orange-500 focus:outline-none bg-white"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} - {r.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-stone-700">
            {isEditing ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEditing}
            className="w-full rounded-lg border border-stone-300 p-3 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              defaultChecked={usuario?.activo}
              className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="activo" className="text-sm font-semibold text-stone-700">
              Usuario activo
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
