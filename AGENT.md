# AGENT.md — El Buen Sabor (Frontend)

> **Rol:** Ingeniero de Software / Especialista en React  
> **Fecha:** Mayo 2026  
> **Versión del Proyecto:** 0.1.0

## Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| **React** | 19.2.x | UI Library |
| **TypeScript** | 6.0.x | Tipado estático |
| **Vite** | 8.0.x | Bundler y Dev Server |
| **React Router** | 7.14.x | Enrutamiento (Data Mode) |
| **Tailwind CSS** | 4.2.x | Estilos utility-first |
| **Socket.io-client** | 4.8.x | Comunicación en tiempo real |
| **@base-ui/react** | 1.4.x | Componentes base accesibles |

---

## Arquitectura del Proyecto

```
src/
├── app/              # Configuración de rutas (Data Mode)
│   └── routes.tsx
├── assets/           # Recursos estáticos (imágenes, logos)
├── components/       # Componentes reutilizables
│   ├── common/       # Componentes compartidos entre módulos (ej. Login, ABM)
│   ├── layout/       # Estructuras de página (Sidebar, AppLayout)
│   └── ui/           # Componentes atómicos (Button, Input, Calendar)
├── lib/              # Utilidades puras y helpers
│   └── utils.ts      # Funciones como `cn` y `extractRubroId`
├── modules/          # Módulos de negocio específicos
│   └── cocina/
│       ├── components/ # Componentes propios del módulo (Column, PedidoCard)
│       └── types.ts    # Tipos específicos del módulo (Pedido, ItemPedido)
├── pages/            # Páginas que se renderizan por ruta
│   ├── Administracion/
│   ├── Cocina/
│   ├── Configuracion/
│   └── Errores/
├── types/            # Tipos globales del dominio
│   └── index.ts      # Interfaces como Plato, Rubro
├── index.css         # Estilos globales y configuración de Tailwind
└── main.tsx          # Entry point (monta RouterProvider)
```

---

## Convenciones de Código

### Nomenclatura
- **Archivos y Carpetas:** `camelCase` o `PascalCase` para componentes React (`CocinaPage.tsx`, `AppLayout.tsx`). Minúsculas para utilidades y tipos (`utils.ts`, `types.ts`).
- **Componentes:** PascalCase (`PedidoCard`, `PlatoFormPage`).
- **Hooks y Funciones:** camelCase (`extractRubroId`, `usePedidos`).
- **Tipos e Interfaces:** PascalCase (`Plato`, `Rubro`, `ItemPedido`).
- **Variables de Estado:** camelCase, descriptivas (`esIlimitado`, `rubroId`).

### Importación de Tipos
- Usa `import type` cuando solo necesites la definición de un tipo.
- Centraliza los tipos de dominio en `src/types/index.ts`.
- Los tipos específicos de un módulo van en `src/modules/<modulo>/types.ts`.

### Estructura de Componentes
1. Imports (React → Router → Componentes UI → Tipos → Utils)
2. Definición del componente (function declaration)
3. Hooks en orden: Datos (useLoaderData) → Navegación (useNavigate) → Estado local (useState) → Efectos (useEffect) → Computados
4. Manejadores de eventos (handlers)
5. JSX (retorno)

---

## React Router v7 — Data Mode

Este proyecto usa **React Router v7 en Data Mode** (no declarativo). Esto significa que la lógica de datos vive en el router, no en los componentes.

### Loaders (Lectura)
Se ejecutan **antes** de renderizar el componente. Reemplazan `useEffect` + `fetch` para carga inicial.
```tsx
// en routes.tsx
const platosLoader = async () => {
  const res = await fetch(`${API_URL}/api/platos`);
  if (!res.ok) throw new Error("Error al cargar");
  return res.json();
};

// en el componente
const platos = useLoaderData() as Plato[];
```

### Actions (Escritura)
Manejan los submits de formularios (`<Form>` de `react-router-dom`).
```tsx
// en routes.tsx
const crearPlatoAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = { nombre: formData.get("nombre"), ... };
  
  const res = await fetch(`${API_URL}/api/platos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) return { error: "Error al crear" };
  return redirect("/cocina/platos");
};

// en routes
{ path: "/cocina/platos/nuevo", element: <PlatoFormPage />, action: crearPlatoAction }
```

### Formularios con Data Mode
- Usa `<Form>` de `react-router-dom` en lugar de `<form>` nativo.
- Usa `encType="multipart/form-data"` si hay archivos.
- Los inputs deben tener el atributo `name` para que `formData.get()` los capture.
- Usa `useNavigation()` para saber si hay un submit en curso (`navigation.state === "submitting"`).
- Usa `useActionData()` para leer respuestas de la action (ej. errores).

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3000
```
> **Importante:** Las variables deben empezar con `VITE_` para ser accesibles en el cliente.

Uso en código:
```ts
const API_URL = import.meta.env.VITE_API_URL;
```

---

## Flujo para crear una nueva página ABM

1. **Crear el tipo** en `src/types/index.ts`:
   ```ts
   export interface Usuario {
     id: number;
     nombre: string;
     email: string;
     // ...
   }
   ```

2. **Crear la página** en `src/pages/<Modulo>/<Modulo>Page.tsx`.
3. **Crear el formulario** en `src/pages/<Modulo>/<Modulo>FormPage.tsx`.
4. **Definir Loader y Action** en `src/app/routes.tsx`.
5. **Agregar la ruta** al array `children` del router.
6. **Agregar el link** en `src/components/layout/Sidebar.tsx`.

---

## Tips de Desarrollo

- **Alias de rutas:** Usá `@/` para referenciar `src/`. Ej: `import type { Plato } from "@/types";`.
- **Utilidades de estilo:** Usá la función `cn()` de `@/lib/utils` para combinar clases de Tailwind condicionalmente.
- **Errores de tipeo:** Ejecutá `npm run build` frecuentemente para detectar errores de TypeScript.
- **Limpiar:** No dejes `console.log` en producción. Usa el `ErrorPage` para manejar errores de UI.

---

## Login / Autenticación — Guía de Implementación

### Estado Actual (Mayo 2026)

| Aspecto | Situación |
|---|---|
| **AuthContext** | No existe |
| **authService** | No existe |
| **Login Page** | Placeholder `Proximamente` en `/login` |
| **Token en uso** | `CocinaPage.tsx` ya lee `localStorage.getItem("token")` y envía `Authorization: Bearer {token}` |
| **Logout** | Sidebar linkea a `/login` (placeholder) |
| **Dependencias de auth** | Ninguna en `package.json` |

### Decisión de Arquitectura

- **JWT con localStorage** (ya hay evidencia de esta decisión en `CocinaPage.tsx:51-53`)
- **`fetch` nativo** para llamadas HTTP (consistente con el resto del proyecto)
- **Context API** para estado global de auth (`AuthContext` + `useAuth` hook)
- **Protección con loaders** de React Router v7 Data Mode (redirigir a `/login` si no hay token)
- **Login con Action** de React Router Data Mode (consistente con `PlatoFormPage`)

### Estructura de Carpetas — Archivos a crear/modificar

```
src/
├── auth/                              # ← CREAR (carpeta nueva)
│   ├── AuthContext.tsx                 # Provider + useAuth hook
│   ├── authService.ts                  # login(), logout(), getToken(), isAuthenticated()
│   └── types.ts                        # LoginCredentials, AuthUser, AuthState
├── pages/
│   └── Auth/                           # ← CREAR (carpeta nueva)
│       └── LoginPage.tsx               # Reemplaza Proximamente en /login
├── app/
│   └── routes.tsx                      # ← MODIFICAR (loginLoader, authLoader, loginAction)
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx               # ← MODIFICAR (protección opcional)
│   │   └── Sidebar.tsx                 # ← MODIFICAR (logout real con useAuth)
│   └── ui/                             # Ya existen: Button, Input, Label
└── main.tsx                            # ← MODIFICAR (wrap con AuthProvider)
```

### Plan de Implementación (8 pasos)

Seguir estrictamente este orden para no romper nada:

---

#### PASO 1 — `src/auth/types.ts`

```ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  rol: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}
```

---

#### PASO 2 — `src/auth/authService.ts`

```ts
import type { LoginCredentials, LoginResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error de conexión" }));
    throw new Error(error.message || "Credenciales inválidas");
  }

  return res.json();
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

export function saveAuth(token: string, user: unknown): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getStoredUser(): unknown {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
```

---

#### PASO 3 — `src/auth/AuthContext.tsx`

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials } from "./types";
import * as authService from "./authService";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = authService.getStoredUser();
    return stored as AuthUser | null;
  });

  const isAuthenticated = !!user && authService.isAuthenticated();

  const loginHandler = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    authService.saveAuth(response.token, response.usuario);
    setUser(response.usuario);
  };

  const logoutHandler = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: loginHandler,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
```

---

#### PASO 4 — `src/main.tsx` (wrap con AuthProvider)

```tsx
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { AuthProvider } from "./auth/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
```

> **⚠️ Importante:** `AuthProvider` debe envolver a `RouterProvider`. El `useAuth()` se usa dentro de loaders/actions (accediendo via módulo — ver paso 6) y dentro de componentes de página.

---

#### PASO 5 — `src/pages/Auth/LoginPage.tsx`

Reemplazar el placeholder `Proximamente` en la ruta `/login`.

```tsx
import { Form, useActionData, useNavigation, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/input";

interface ActionData {
  error?: string;
}

export const LoginPage = () => {
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-700">El Buen Sabor</h1>
          <p className="text-sm text-gray-500 mt-1">Iniciar sesión</p>
        </div>

        <Form method="post" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {actionData?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
              {actionData.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </Form>

        <p className="text-xs text-gray-400 text-center mt-6">
          ¿Olvidaste tu contraseña? Contacta al administrador.
        </p>
      </div>
    </div>
  );
};
```

---

#### PASO 6 — `src/app/routes.tsx` (agregar loginLoader, authLoader, loginAction)

Agregar estas funciones **antes** de la definición del router:

```tsx
/**
 * @description Protege rutas que requieren autenticacion. Redirige a /login si no hay token.
 */
const authLoader = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return redirect("/login");
  }
  return null;
};

/**
 * @description Redirige a /cocina si el usuario ya esta autenticado (pagina de login).
 */
const loginLoader = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    return redirect("/cocina");
  }
  return null;
};

/**
 * @description Procesa el formulario de login: llama al backend y guarda token + usuario.
 */
const loginAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Error de conexión" }));
      return { error: err.message || "Credenciales inválidas" };
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.usuario));

    return redirect("/cocina");
  } catch {
    return { error: "Error de conexión con el servidor" };
  }
};
```

Luego, **modificar las rutas**:
- Agregar `loader: authLoader` a TODAS las rutas hijas que requieran login
- Reemplazar la ruta `/login` para usar `LoginPage` + `loginLoader` + `loginAction`
- Mover el `AppLayout` debajo de una ruta pública para login

Estructura final del router:

```tsx
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    loader: authLoader,  // protege TODO el layout
    children: [
      { path: "/", element: <CocinaPage /> },
      { path: "/cocina", element: <CocinaPage /> },
      { path: "/cocina/platos", element: <PlatosPage />, loader: platosLoader, errorElement: <ErrorPage /> },
      { path: "/cocina/platos/nuevo", element: <PlatoFormPage />, action: crearPlatoAction, errorElement: <ErrorPage /> },
      { path: "/configuracion", element: <ConfigPage /> },
      {
        path: "/cocina/platos/:id",
        element: <PlatoFormPage />,
        loader: platoLoader,
        action: editarPlatoAction,
        errorElement: <ErrorPage />,
      }
    ],
  },
  // Ruta de login FUERA del AppLayout (sin sidebar)
  {
    element: <LoginPage />,
    path: "/login",
    loader: loginLoader,
    action: loginAction,
  },
]);
```

> **⚠️ Importante:** Si `authLoader` se pone en el layout padre, `/login` debe estar fuera de ese layout (sidebar incluida) para que la página de login se vea limpia, sin sidebar.

---

#### PASO 7 — `src/components/layout/Sidebar.tsx` (logout real)

Modificar el link "Salir" para usar `useAuth`:

```tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    // ... resto igual ...
    <div className="mt-auto">
      <Link to="/configuracion" ...>Configuración</Link>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-100 rounded cursor-pointer w-full"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-sm font-medium">Salir</span>
      </button>
    </div>
  );
};
```

---

#### PASO 8 — `src/components/layout/AppLayout.tsx` (opcional: pasar user al layout)

Si se necesita el usuario en el layout (ej. mostrar nombre en sidebar), leer `useAuth` en `Sidebar.tsx` (ya se importa en paso 7).

---

### Endpoints del Backend (esperados)

| Método | Ruta | Body / Response |
|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, usuario: { id, username, email, rol } }` |
| `GET` | `/api/auth/me` | (con `Authorization: Bearer token`) → `{ id, username, email, rol }` |

---

### Estados de UI a cubrir en LoginPage

1. **Carga** → botón deshabilitado con texto "Ingresando..."
2. **Error de credenciales** → mostrar mensaje en caja roja
3. **Error de red** → "Error de conexión con el servidor"
4. **Ya autenticado** → `loginLoader` redirige a `/cocina`

### Reglas para no romper nada

| Regla | Detalle |
|---|---|
| No eliminar imports existentes | Solo agregar los nuevos |
| No cambiar loaders/actions existentes | Solo agregar `authLoader` a rutas |
| Login fuera del AppLayout | Para que no herede la sidebar |
| Usar `localStorage` | Consistente con el uso actual en `CocinaPage.tsx` |
| No agregar dependencias npm | Todo se hace con `fetch` nativo |
| Mantener JSDoc | Cada función debe tener su `@description` |
