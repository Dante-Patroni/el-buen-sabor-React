# Migración a Modo de Datos — React Router v7

> **Fecha:** Abril 2025  
> **Proyecto:** El Buen Sabor (React + Vite + TypeScript)

---

## ¿Qué es el Modo de Datos?

React Router v7 ofrece tres modos de enrutamiento:

| Modo | Cómo se configura | Características |
|---|---|---|
| **Marco** | `react-router.config.ts` | File-based routing, SSR, full-stack |
| **Declarativo** | `<Routes>` + `<Route>` en JSX | Clásico, simple, sin data APIs |
| **Datos** ✅ | `createBrowserRouter()` | Loaders, Actions, Fetchers integrados |

Este proyecto fue migrado del **Modo Declarativo** al **Modo de Datos**.

---

## ¿Qué problema resuelve?

Con el modo declarativo, cada componente tenía que buscar sus propios datos **después** de renderizarse:

```tsx
// ❌ Modo Declarativo — el componente se renderiza vacío primero
useEffect(() => {
  fetch("/api/platos")
    .then(res => res.json())
    .then(data => setPlatos(data)); // llega después
}, []);
```

Con el **Modo de Datos**, el router busca los datos **antes** de renderizar el componente:

```tsx
// ✅ Modo de Datos — los datos llegan antes de renderizar
const platos = useLoaderData(); // ya están listos
```

---

## Archivos modificados

### 1. `src/main.tsx`

**Antes:**
```tsx
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
```

**Después:**
```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

**Por qué:** `RouterProvider` es el componente que "entiende" el objeto `router` creado con `createBrowserRouter`. El `BrowserRouter` es solo para el modo declarativo.

---

### 2. `src/app/routes.tsx`

**Antes:**
```tsx
import { Routes, Route } from "react-router-dom";

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/"                    element={<CocinaPage />} />
      <Route path="/cocina"              element={<CocinaPage />} />
      <Route path="/cocina/platos"       element={<PlatosPage />} />
      <Route path="/cocina/platos/nuevo" element={<PlatoFormPage />} />
      <Route path="/cocina/platos/:id"   element={<PlatoFormPage />} />
    </Route>
  </Routes>
);
```

**Después:**
```tsx
import { createBrowserRouter } from "react-router-dom";

// Loader: se ejecuta ANTES de renderizar PlatosPage
const platosLoader = async () => {
  // En producción, reemplazar con:
  // const res = await fetch("http://localhost:8080/api/platos");
  // return res.json();

  await new Promise((resolve) => setTimeout(resolve, 300)); // simula latencia
  return [
    { id: 1, nombre: "Hamburguesa", precio: 5000, stock: 10, esActivo: true, rubro: { nombre: "Platos Fuertes" } },
    { id: 2, nombre: "Ensalada Caesar", precio: 3500, stock: 5, esActivo: true, rubro: { nombre: "Entradas" } },
    { id: 3, nombre: "Volcán de Chocolate", precio: 2500, stock: 0, esActivo: false, rubro: { nombre: "Postres" } },
  ];
};

export const router = createBrowserRouter([
  {
    element: <AppLayout />,       // Ruta padre sin path → layout compartido
    children: [
      { path: "/",                    element: <CocinaPage /> },
      { path: "/cocina",              element: <CocinaPage /> },
      { path: "/cocina/platos",       element: <PlatosPage />,    loader: platosLoader },
      { path: "/cocina/platos/nuevo", element: <PlatoFormPage /> },
      { path: "/cocina/platos/:id",   element: <PlatoFormPage /> },
    ],
  },
]);
```

**Por qué:** En lugar de exportar un componente JSX, exportamos un **objeto de configuración** del router. La propiedad `loader` en cada ruta permite asociar una función de fetching directamente a esa ruta.

---

### 3. `src/modules/cocina/pages/PlatosPage.tsx`

**Antes:**
```tsx
// Datos definidos hardcodeados dentro del componente
const platos = [
  { id: 1, nombre: "Hamburguesa", ... },
  { id: 2, nombre: "Ensalada Caesar", ... },
];
```

**Después:**
```tsx
import { useLoaderData } from "react-router-dom";

interface Plato {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  esActivo: boolean;
  rubro: { nombre: string };
}

export const PlatosPage = () => {
  const navigate = useNavigate();

  // Los datos ya llegaron desde el loader, sin useState ni useEffect
  const platos = useLoaderData() as Plato[];

  // ... resto del componente igual
};
```

**Por qué:** `useLoaderData()` es el hook que "recibe" lo que devolvió el `loader` de la ruta correspondiente. El componente ya no necesita manejar estados de carga.

---

## Flujo completo del Modo de Datos

```
Usuario navega a /cocina/platos
        ↓
React Router detecta que esa ruta tiene un loader (platosLoader)
        ↓
Ejecuta platosLoader() → hace fetch a la API
        ↓
Cuando los datos están listos → renderiza <PlatosPage />
        ↓
PlatosPage llama useLoaderData() → recibe los datos inmediatamente
        ↓
Se muestra la tabla con los platos ✅
```

---

## Cómo conectar la API real

Cuando el backend esté disponible, solo hay que cambiar el loader en `routes.tsx`. **El componente `PlatosPage` no necesita ningún cambio.**

```tsx
// routes.tsx — cambio mínimo para conectar la API real
const platosLoader = async () => {
  const res = await fetch("http://localhost:8080/api/platos");
  if (!res.ok) throw new Error("Error al cargar los platos");
  return res.json();
};
```

---

## Ventajas del Modo de Datos

| Aspecto | Modo Declarativo | Modo de Datos |
|---|---|---|
| Estado de carga (`useState`) | ✅ Necesario | ❌ No necesario |
| `useEffect` para fetch | ✅ Necesario | ❌ No necesario |
| Datos disponibles al renderizar | ❌ No | ✅ Sí |
| Manejo de errores centralizado | ❌ Manual | ✅ Con `errorElement` |
| Code splitting por ruta | ❌ Manual | ✅ Con `lazy()` |

---

## Referencias

- [React Router — Data Mode](https://reactrouter.com/start/data/routing)
- [createBrowserRouter](https://reactrouter.com/api/functions/createBrowserRouter)
- [useLoaderData](https://reactrouter.com/api/hooks/useLoaderData)
- [RouterProvider](https://reactrouter.com/api/components/RouterProvider)
