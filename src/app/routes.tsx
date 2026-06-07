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

import { extractRubroId } from "@/lib/utils";
import { authFetch } from "@/lib/authFetch";

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

/**
 * @description Carga el listado de platos y normaliza el identificador de rubro recibido desde el backend.
 * @returns {Promise<unknown>} Listado de platos normalizado o respuesta original si no es un arreglo.
 * @throws {Error} Error al cargar los platos.
 */
const platosLoader = async () => {
  const res = await authFetch("/api/platos");

  if (!res.ok) {
    throw new Error("Error al cargar los platos");
  }

  const platos = await res.json();

  if (!Array.isArray(platos)) {
    return platos;
  }

  return platos.map((plato: any) => ({
    ...plato,
    rubroId: extractRubroId(plato),
  }));
};

/**
 * @description Carga un plato por ID para inicializar el formulario de edición.
 * @param {LoaderFunctionArgs} args - Argumentos del loader con los parámetros de ruta.
 * @returns {Promise<unknown>} Plato normalizado con rubroId.
 * @throws {Error} Error al cargar el plato.
 */
const platoLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  const res = await authFetch(
    `/api/platos/${params.id}`
  );

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

/**
 * @description Procesa la edición de un plato y sube una imagen nueva cuando el formulario la incluye.
 * @param {ActionFunctionArgs} args - Argumentos de la action con request y parámetros de ruta.
 * @returns {Promise<Response|{error: string}>} Redirección al catálogo o mensaje de error para la UI.
 */
const editarPlatoAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const id = params.id!;

  const formData = await request.formData();

  console.log("=== EDITAR PLATO ===");
  console.log("ID:", id);

  const esIlimitado =
    formData.get("esIlimitado") === "on";

  const payload = {
    nombre: formData.get("nombre"),
    precio: Number(formData.get("precio")),
    descripcion: formData.get("descripcion"),
    rubroId: Number(formData.get("rubroId")),
    esIlimitado,
    esMenuDelDia:
      formData.get("esMenuDelDia") === "on",
    esActivo:
      formData.get("esActivo") === "on",
    stockActual: esIlimitado
      ? null
      : Number(formData.get("stockActual")),
  };

  try {
    const res = await authFetch(
      `/api/platos/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();

      console.error(
        "Error al editar plato:",
        text
      );

      return {
        error: "Error al editar plato",
      };
    }

    const imagenFile =
      formData.get("imagen") as File | null;

    console.log(
      "Imagen:",
      imagenFile?.name || "NINGUNA"
    );

    if (
      imagenFile &&
      imagenFile.size > 0
    ) {
      const imgFormData = new FormData();

      imgFormData.append(
        "imagen",
        imagenFile
      );

      const imgRes = await authFetch(
        `/api/platos/${id}/imagen`,
        {
          method: "POST",
          body: imgFormData,
        }
      );

      if (!imgRes.ok) {
        console.error(
          "ERROR IMG:",
          await imgRes.text()
        );
      } else {
        const data = await imgRes.json();

        console.log("IMG OK:", data);
      }
    }

    return redirect("/cocina/platos");
  } catch (error) {
    console.error(
      "Error en editarPlatoAction:",
      error
    );

    return {
      error: "Error en el proceso",
    };
  }
};

/**
 * @description Procesa la creación de un plato y sube su imagen inicial cuando corresponde.
 * @param {ActionFunctionArgs} args - Argumentos de la action con los datos del formulario.
 * @returns {Promise<Response|{error: string}>} Redirección al catálogo o mensaje de error para la UI.
 */
const crearPlatoAction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  console.log("=== CREAR PLATO ===");

  if (!formData.get("nombre")) {
    return {
      error: "El nombre es obligatorio",
    };
  }

  const esIlimitado =
    formData.get("esIlimitado") === "on";

  const payload = {
    nombre: formData.get("nombre"),
    precio: Number(formData.get("precio")),
    descripcion: formData.get("descripcion"),
    rubroId: Number(formData.get("rubroId")),
    esIlimitado,
    esMenuDelDia:
      formData.get("esMenuDelDia") === "on",
    esActivo:
      formData.get("esActivo") === "on",
    stockActual: esIlimitado
      ? null
      : Number(formData.get("stockActual")),
  };

  try {
    const res = await authFetch(
      `/api/platos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();

      console.error(
        "Error al crear plato:",
        text
      );

      return {
        error: "Error al crear plato",
      };
    }

    const nuevoPlato = await res.json();

    console.log(
      "Plato creado con ID:",
      nuevoPlato.id
    );

    const imagenFile =
      formData.get("imagen") as File | null;

    console.log(
      "Imagen:",
      imagenFile?.name || "NINGUNA"
    );

    if (
      imagenFile &&
      imagenFile.size > 0
    ) {
      const imgFormData = new FormData();

      imgFormData.append(
        "imagen",
        imagenFile
      );

      const imgRes = await authFetch(
        `/api/platos/${nuevoPlato.id}/imagen`,
        {
          method: "POST",
          body: imgFormData,
        }
      );

      if (!imgRes.ok) {
        console.error(
          "ERROR IMG:",
          await imgRes.text()
        );
      } else {
        const data = await imgRes.json();

        console.log("IMG OK:", data);
      }
    }

    return redirect("/cocina/platos");
  } catch (error) {
    console.error(
      "Error en crearPlatoAction:",
      error
    );

    return {
      error: "Error al crear plato",
    };
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

const usuariosLoader = async () => {
  const res = await authFetch("/api/usuarios");
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
};

const ROLES_HARDCODED = [
  { id: 1, nombre: "superadmin", descripcion: "Acceso total al sistema" },
  { id: 2, nombre: "admin", descripcion: "Administrador del restaurante" },
  { id: 3, nombre: "cajero", descripcion: "Operador de caja" },
  { id: 4, nombre: "cocinero", descripcion: "Operador de cocina" },
  { id: 5, nombre: "mozo", descripcion: "Atención de mesas y pedidos" },
];

const usuarioFormLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.id) return { roles: ROLES_HARDCODED };
  const res = await authFetch(`/api/usuarios/${params.id}`);
  if (!res.ok) throw new Error("Error al cargar usuario");
  const usuario = await res.json();
  return { usuario, roles: ROLES_HARDCODED };
};

const crearUsuarioAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries()) as Record<string, any>;
  payload.rolId = Number(payload.rolId);
  
  const res = await authFetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    return { error: errorMsg || "Error al crear usuario" };
  }
  return redirect("/administracion/usuarios");
};

const editarUsuarioAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries()) as Record<string, any>;
  payload.rolId = Number(payload.rolId);
  payload.activo = payload.activo === "on";
  if (!payload.password) delete payload.password;

  const res = await authFetch(`/api/usuarios/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

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