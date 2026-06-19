# AGENT.md — Proyecto React (Plantilla)

> **Rol:** Ingeniero de Software / Especialista en React  
> **Fecha:** Junio 2026  
> **Versión del Proyecto:** 0.1.0

## Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| **React** | 19.2.x | UI Library |
| **TypeScript** | 6.0.x | Tipado estático |
| **Vite** | 8.0.x | Bundler y Dev Server |
| **React Router** | 7.14.x | Enrutamiento (Data Mode) |
| **Tailwind CSS** | 4.2.x | Estilos utility-first |
| **@base-ui/react** | 1.4.x | Componentes base accesibles |

---

## Arquitectura del Proyecto

```
src/
├── app/
│   └── routes.tsx              # Configuración de rutas (Data Mode), loaders y actions
├── assets/                     # Recursos estáticos (imágenes, logos)
├── auth/                       # Sistema de autenticación y permisos
│   ├── AuthContext.tsx          # Provider global + hook useAuth
│   ├── authService.ts           # login(), logout(), getToken(), getUser()
│   ├── permisos.ts              # Constantes de permisos (PLATO_CREAR, USUARIO_VER…)
│   ├── RequirePermiso.tsx       # Componente guard basado en permisos
│   └── types.ts                 # LoginCredentials, AuthUser, AuthState
├── components/
│   ├── <Modulo>/               # Componentes específicos de una sección (ej. Administracion/)
│   ├── layout/                  # Estructuras de página (Sidebar, AppLayout)
│   └── ui/                      # Componentes atómicos (Button, Input, Select, Card, Label)
├── lib/
│   ├── api/                     # Capa de acceso a la API, agrupada por entidad
│   │   ├── <entidad>.api.ts     # ej. usuarios.api.ts, platos.api.ts
│   ├── authFetch.ts             # Wrapper de fetch que agrega el JWT automáticamente
│   ├── mappings.ts              # Mappings globales (estilos de badge, listas hardcodeadas)
│   └── utils.ts                 # Helpers puros (cn, flattenRubros, extractRubroId…)
├── modules/                     # Módulos de negocio con lógica y UI propias
│   └── <modulo>/
│       ├── components/          # Componentes exclusivos del módulo
│       └── types.ts             # Re-exporta desde @/types si aplica
├── pages/                       # Páginas que se renderizan por ruta
│   ├── Auth/
│   ├── Errores/
│   └── <Modulo>/
├── types/                       # Tipos globales del dominio, divididos por entidad
│   ├── index.ts                 # Barrel: re-exporta todos los tipos
│   ├── <entidad>.types.ts       # ej. usuario.types.ts, plato.types.ts, pedido.types.ts
├── index.css                    # Estilos globales y configuración de Tailwind
└── main.tsx                     # Entry point (monta RouterProvider + AuthProvider)
```

---

## Convenciones de Código

### Nomenclatura
- **Archivos y Carpetas:** `PascalCase` para componentes React (`CocinaPage.tsx`). Minúsculas con punto para módulos (`utils.ts`, `usuarios.api.ts`, `usuario.types.ts`).
- **Componentes:** PascalCase (`UsuariosTable`, `PlatoFormPage`).
- **Hooks y Funciones:** camelCase (`flattenRubros`, `getRolBadgeClass`).
- **Tipos e Interfaces:** PascalCase (`Plato`, `Rubro`, `ItemPedido`).
- **Constantes de mapeo:** SCREAMING_SNAKE_CASE (`ROL_BADGE_STYLES`, `ROLES_HARDCODED`).

### Importación de Tipos
- Usar `import type` cuando solo se necesite la definición.
- Los tipos de dominio van en `src/types/<entidad>.types.ts` y se importan desde el barrel `@/types`.
- No duplicar tipos entre archivos.

### Componentes UI
- Usar siempre los componentes del sistema (`Button`, `Input`, `Select`) en lugar de tags HTML crudos con clases Tailwind inline.
- Si un elemento se repite con estilos custom, crear un wrapper en `src/components/ui/`.

### Capa de API
- Las funciones que hacen fetch van en `src/lib/api/<entidad>.api.ts`.
- Desde ahí invocan `authFetch`. Los loaders/actions de routes solo llaman a estas funciones.
- No hardcodear endpoints en los componentes.

### Mappings y Constantes
- Objetos de mapeo (estilos, listas fijas) → `src/lib/mappings.ts`.
- Helpers de transformación reutilizables → `src/lib/utils.ts`.
- No definir estos inline dentro de los componentes.

### Estructura de Componentes
1. Imports (React → Router → Componentes UI → Tipos → Utils → Lib)
2. Constantes locales (arrays, objetos que no van a mappings por ser específicos)
3. Hooks en orden: Datos (useLoaderData) → Navegación → Estado local → Efectos → Computados
4. Handlers
5. JSX (return)

---

## React Router Data Mode

Este proyecto usa **React Router v7 en Data Mode**. La lógica de datos vive en el router, no en los componentes.

### Loaders (Lectura)
Se ejecutan **antes** de renderizar el componente. Reemplazan `useEffect + fetch` para la carga inicial.
```tsx
const platosLoader = async () => getPlatos(); // función de lib/api/
```

### Actions (Escritura)
Manejan los submits de formularios con `<Form>` de react-router-dom.
```tsx
const crearAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = { nombre: formData.get("nombre"), ... };
  const res = await crearEntidad(payload); // función de lib/api/
  if (!res.ok) return { error: "Error al crear" };
  return redirect("/ruta");
};
```

### Formularios
- Usar `<Form>` de `react-router-dom`, no `<form>` nativo.
- Los inputs deben tener atributo `name` para que `formData.get()` los capture.
- Usar `useNavigation()` para estado de submit (`navigation.state === "submitting"`).
- Usar `useActionData()` para leer errores del action.

---

## Variables de Entorno

Crear `.env` en la raíz:
```env
VITE_API_URL=http://localhost:3000
```

Uso en código:
```ts
const API_URL = import.meta.env.VITE_API_URL;
```

> Las variables deben empezar con `VITE_` para ser accesibles en el cliente.

---

## Flujo ABM (Alta, Baja, Modificación)

1. **Crear el tipo** en `src/types/<entidad>.types.ts` y re-exportar desde `index.ts`.
2. **Crear funciones de API** en `src/lib/api/<entidad>.api.ts`.
3. **Crear la página listado** en `src/pages/<Modulo>/<Modulo>Page.tsx`.
4. **Crear el formulario** en `src/pages/<Modulo>/<Modulo>FormPage.tsx`.
5. **Extraer la tabla** a `src/components/<Modulo>/<Modulo>Table.tsx` si tiene más de ~50 líneas.
6. **Definir Loader y Action** en `src/app/routes.tsx`, usando las funciones de `lib/api/`.
7. **Agregar la ruta** al array `children` del router.
8. **Agregar el link** en `src/components/layout/Sidebar.tsx`.

---

## Autenticación

### Estrategia
- JWT guardado en `localStorage` (token + usuario).
- Rutas privadas protegidas por `authLoader` en React Router.
- Estado global de auth via `AuthContext` + `useAuth` hook.
- Permisos granulares con `RequirePermiso` y constantes en `permisos.ts`.

### authFetch
```ts
// lib/authFetch.ts — agrega automáticamente el Bearer token
export const authFetch = async (endpoint: string, options: RequestInit = {}) => { ... };
```
Todas las funciones de `lib/api/` lo invocan. No usar fetch directamente en loaders ni componentes.

### Protección de rutas
```tsx
// authLoader verifica el token
const authLoader = async () => {
  if (!getToken()) return redirect("/login");
  return null;
};
```

### Permisos de UI
```tsx
<RequirePermiso permisos={[USUARIO_CREAR]}>
  <Button>Nuevo</Button>
</RequirePermiso>
```

---

## ErrorPage

```tsx
export const ErrorPage = () => {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);
  const titulo = isRouteError ? `Error ${error.status}` : "Error inesperado";
  const mensaje = isRouteError
    ? error.statusText
    : error instanceof Error ? error.message : "Algo salió mal";
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600">{titulo}</h1>
      {mensaje && <p className="text-gray-600 mt-2">{mensaje}</p>}
      {isRouteError && error.data && <pre className="mt-4 bg-gray-100 p-4 rounded">{error.data}</pre>}
    </div>
  );
};
```

---

## Reglas del proyecto

| Regla | Detalle |
|---|---|
| No hardcodear endpoints | Van en `lib/api/<entidad>.api.ts` |
| No duplicar tipos | Un type, un archivo, re-exportado desde barrel |
| No definir mappings inline | Van en `lib/mappings.ts` |
| Usar componentes UI | No usar `<button>`, `<input>`, `<select>` crudos con Tailwind |
| Componentizar tablas grandes | Extraer a `components/<Modulo>/` si supera ~50 líneas |
| Mantener JSDoc | Cada función exportada debe tener su `@description` |
| Login fuera del AppLayout | Para que no herede la sidebar |
