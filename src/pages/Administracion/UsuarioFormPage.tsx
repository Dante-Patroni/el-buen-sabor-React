import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import type { Usuario, Rol } from "../../types";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import { Alert } from "@/components/ui/Alert";
import { FormField, FormSelect, LABEL_STYLES } from "@/components/ui/FormField";

export const UsuarioFormPage = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { usuario, roles } = useLoaderData() as { usuario?: Usuario; roles: Rol[] };
  const actionData = useActionData() as { error?: string } | undefined;
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!usuario;

  return (
    <div className="p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_2fr]">
        <div className="space-y-6">
          <div>
            <Heading as="h1">
              {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            </Heading>
            <p className="mt-3 text-sm text-stone-600">
              Administre la identidad y los permisos del personal de{" "}
              <span className="font-semibold text-red-800">El Buen Sabor</span>. Asegúrese de
              asignar el rol correcto para garantizar el acceso adecuado a las herramientas de
              cocina, salón y administración.
            </p>
          </div>

          <div className="rounded-2xl border-l-4 border-red-800 bg-stone-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
              Guía Rápida
            </p>
            <ul className="space-y-2 text-sm text-stone-700">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-800" />
                <span>El <strong>Legajo</strong> es el identificador único del empleado.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-800" />
                <span>Los <strong>Mozos</strong> tienen acceso restringido al punto de venta.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-800" />
                <span>La <strong>Contraseña</strong> debe ser privada y personal.</span>
              </li>
            </ul>
          </div>
        </div>

        <Form
          method={isEditing ? "put" : "post"}
          className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          {actionData?.error && <Alert>{actionData.error}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nombre"
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={usuario?.nombre}
              required
              placeholder="Ej: Julian"
            />

            <FormField
              label="Apellido"
              id="apellido"
              name="apellido"
              type="text"
              defaultValue={usuario?.apellido}
              required
              placeholder="Ej: Alvarez"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Legajo"
              id="legajo"
              name="legajo"
              type="text"
              defaultValue={usuario?.legajo}
              required
              placeholder="ID-4029"
            />

            <FormSelect label="Rol" id="rolId" name="rolId" defaultValue={usuario?.rolId} required>
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} - {r.descripcion}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className={LABEL_STYLES}>
              {isEditing ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                required={!isEditing}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3 pr-11 focus:border-red-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {isEditing && (
            <label
              htmlFor="activo"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-stone-900">Usuario Activo</p>
                <p className="text-sm text-stone-500">
                  El usuario podrá iniciar sesión inmediatamente.
                </p>
              </div>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  defaultChecked={usuario?.activo}
                  className="peer sr-only"
                />
                <span className="block h-7 w-12 rounded-full bg-stone-300 transition-colors peer-checked:bg-red-800" />
                <span className="absolute left-1 top-1 size-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          )}

          <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-800 px-5 text-white hover:bg-red-900"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
