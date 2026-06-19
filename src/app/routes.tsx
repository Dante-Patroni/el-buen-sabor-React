import { createBrowserRouter, redirect } from "react-router-dom";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";

import { CocinaPage } from "../pages/Cocina/CocinaPage";
import { PlatosPage } from "../pages/Cocina/PlatosPage";
import { PlatoFormPage } from "../pages/Cocina/PlatoFormPage";

import { UsuariosPage } from "../pages/Administracion/UsuariosPage";
import { UsuarioFormPage } from "../pages/Administracion/UsuarioFormPage";

import { LoginPage } from "../pages/Auth/LoginPage";

import { ErrorPage } from "../pages/Errores/ErrorPage";
import { ConfigPage } from "../pages/Configuracion/ConfigPage";
import { CajaPage } from "../pages/Caja/CajaPage";
import { AccesoDenegado } from "../pages/Errores/AccesoDenegado";

import { ROLES_HARDCODED } from "@/lib/mappings";
import { getPlatos, getPlato, createPlato, updatePlato, uploadPlatoImagen } from "@/lib/api/platos.api";
import { getUsuarios, getUsuario, createUsuario, updateUsuario } from "@/lib/api/usuarios.api";

import {
  login,
  saveAuth,
  getToken,
  getUser,
} from "@/auth/authService";

import { RequirePermiso } from "@/auth/RequirePermiso";
import {
  PEDIDO_VER,
  MESA_VER,
  TICKET_VER,
  MESA_COBRAR,
  PLATO_CREAR,
  PLATO_MODIFICAR,
  PLATO_ELIMINAR,
  USUARIO_VER,
  USUARIO_CREAR,
  USUARIO_MODIFICAR,
} from "@/auth/permisos";

/**
 * Determina la ruta de inicio (Dashboard) correspondiente a cada rol de usuario.
 * @param {string} rol - El rol del usuario obtenido del sistema de autenticación.
 * @returns {string} El path absoluto de la ruta inicial.
 */
const getHomeByRole = (rol: string): string => {
  switch (rol) {
    case "superadmin":
      return "/cocina/platos";

    case "admin":
      return "/cocina/platos";

    case "cocinero":
      return "/cocina";

    case "cajero":
      return "/caja";

    case "mozo":
      return "/mesas";

    default:
      return "/";
  }
};

/**
 * Loader de seguridad global. 
 * Verifica la existencia de una sesión activa antes de permitir el acceso a rutas hijas.
 * @returns {null | Response} Redirige a /login si no hay token.
 */
const authLoader = async () => {
  const token = getToken();

  if (!token) {
    return redirect("/login");
  }

  return null;
};

/**
 * Loader de inicialización de la aplicación.
 * Evalúa el rol del usuario autenticado para redirigirlo a su página principal correspondiente.
 */
const rootLoader = async () => {
  const token = getToken();

  if (!token) {
    return redirect("/login");
  }

  const user = getUser();

  return redirect(
    getHomeByRole(user?.rol || "")
  );
};

/**
 * Loader para la página de acceso.
 * Si el usuario ya posee una sesión válida, impide el re-acceso al login.
 */
const loginLoader = async () => {
  const token = getToken();

  if (token) {
    const user = getUser();

    return redirect(
      getHomeByRole(user?.rol || "")
    );
  }

  return null;
};

const platosLoader = async () => getPlatos();

const platoLoader = async ({ params }: LoaderFunctionArgs) => getPlato(params.id!);

const editarPlatoAction = async ({ request, params }: ActionFunctionArgs) => {
  const id = params.id!;
  const formData = await request.formData();
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
    const res = await updatePlato(id, payload);
    if (!res.ok) return { error: "Error al editar plato" };

    const imagenFile = formData.get("imagen") as File | null;
    if (imagenFile && imagenFile.size > 0) {
      await uploadPlatoImagen(id, imagenFile);
    }

    return redirect("/cocina/platos");
  } catch {
    return { error: "Error en el proceso" };
  }
};

const crearPlatoAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  if (!formData.get("nombre")) return { error: "El nombre es obligatorio" };

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
    const res = await createPlato(payload);
    if (!res.ok) return { error: "Error al crear plato" };

    const nuevoPlato = await res.json();
    const imagenFile = formData.get("imagen") as File | null;
    if (imagenFile && imagenFile.size > 0) {
      await uploadPlatoImagen(nuevoPlato.id, imagenFile);
    }

    return redirect("/cocina/platos");
  } catch {
    return { error: "Error al crear plato" };
  }
};

/**
 * @description Procesa el login del usuario contra el backend.
 */
const loginAction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const legajo = formData.get("legajo");
  const password =
    formData.get("password");

  if (!legajo || !password) {
    return {
      error:
        "Todos los campos son obligatorios",
    };
  }

  try {
    const data = await login({
      legajo: String(legajo),
      password: String(password),
    });

    saveAuth(
      data.token,
      data.usuario
    );

    return redirect(
      getHomeByRole(data.usuario.rol)
    );
  } catch (error) {
    console.error(error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Error de conexión con el servidor",
    };
  }
};

const usuariosLoader = async () => getUsuarios();

const usuarioFormLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.id) return { roles: ROLES_HARDCODED };
  const usuario = await getUsuario(params.id);
  return { usuario, roles: ROLES_HARDCODED };
};

const crearUsuarioAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries()) as Record<string, unknown>;
  payload.rolId = Number(payload.rolId);

  const res = await createUsuario(payload);
  if (!res.ok) {
    const errorMsg = await res.text();
    return { error: errorMsg || "Error al crear usuario" };
  }
  return redirect("/administracion/usuarios");
};

const editarUsuarioAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries()) as Record<string, unknown>;
  payload.rolId = Number(payload.rolId);
  payload.activo = payload.activo === "on";
  if (!payload.password) delete payload.password;

  const res = await updateUsuario(params.id!, payload);
  if (!res.ok) {
    const errorMsg = await res.text();
    return { error: errorMsg || "Error al actualizar usuario" };
  }
  return redirect("/administracion/usuarios");
};

export const router =
  createBrowserRouter([
    /**
     * Rutas públicas.
     */
    {
      path: "/login",
      element: <LoginPage />,
      loader: loginLoader,
      action: loginAction,
    },

    /**
     * Rutas protegidas.
     */
    {
      element: <AppLayout />,
      loader: authLoader,

      children: [
        {
          path: "/",
          loader: rootLoader,
        },

        {
          path: "/cocina",
          element: (
            <RequirePermiso permisos={[PEDIDO_VER]} fallback={<AccesoDenegado />}>
              <CocinaPage />
            </RequirePermiso>
          ),
        },

        {
          path: "/cocina/platos",
          element: (
            <RequirePermiso permisos={[PLATO_CREAR, PLATO_MODIFICAR, PLATO_ELIMINAR]} fallback={<AccesoDenegado />}>
              <PlatosPage />
            </RequirePermiso>
          ),
          loader: platosLoader,
          errorElement: <ErrorPage />,
        },

        {
          path: "/administracion/usuarios",
          element: (
            <RequirePermiso permisos={[USUARIO_VER]} fallback={<AccesoDenegado />}>
              <UsuariosPage />
            </RequirePermiso>
          ),
          loader: usuariosLoader,
          errorElement: <ErrorPage />,
        },

        {
          path: "/administracion/usuarios/nuevo",
          element: (
            <RequirePermiso permisos={[USUARIO_CREAR]} fallback={<AccesoDenegado />}>
              <UsuarioFormPage />
            </RequirePermiso>
          ),
          loader: usuarioFormLoader,
          action: crearUsuarioAction,
          errorElement: <ErrorPage />,
        },

        {
          path: "/administracion/usuarios/:id",
          element: (
            <RequirePermiso permisos={[USUARIO_MODIFICAR]} fallback={<AccesoDenegado />}>
              <UsuarioFormPage />
            </RequirePermiso>
          ),
          loader: usuarioFormLoader,
          action: editarUsuarioAction,
          errorElement: <ErrorPage />,
        },

        {
          path: "/cocina/platos/nuevo",
          element: (
            <RequirePermiso permisos={[PLATO_CREAR]} fallback={<AccesoDenegado />}>
              <PlatoFormPage />
            </RequirePermiso>
          ),
          action: crearPlatoAction,
          errorElement: <ErrorPage />,
        },

        {
          path: "/caja",
          element: (
            <RequirePermiso permisos={[MESA_VER, TICKET_VER, MESA_COBRAR]} fallback={<AccesoDenegado />}>
              <CajaPage />
            </RequirePermiso>
          ),
          errorElement: <ErrorPage />,
        },

        {
          path: "/configuracion",
          element: <ConfigPage />,
        },

        {
          path: "/cocina/platos/:id",
          element: (
            <RequirePermiso permisos={[PLATO_MODIFICAR]} fallback={<AccesoDenegado />}>
              <PlatoFormPage />
            </RequirePermiso>
          ),
          loader: platoLoader,
          action: editarPlatoAction,
          errorElement: <ErrorPage />,
        },
      ],
    },
  ]);