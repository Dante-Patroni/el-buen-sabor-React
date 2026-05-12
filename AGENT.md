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

## React Router Data Mode

Este proyecto usa **React Router v7 en Data Mode** (no declarativo). Esto significa que la lógica de datos vive en el router, no en los componentes.

### Loaders (Lectura)
Se ejecutan **antes** de renderizar el componente. Reemplazan `useEffect` + `fetch` para carga inicial.
```tsx
const res = await fetch(`${API_URL}/api/platos`);
if (!res.ok) throw new Error("Error al cargar");
return res.json();
```

### Actions (Escritura)
Manejan los submits de formularios (`<Form>` de `react-router-dom`).
```tsx
Args) => {
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

## Flujo ABM

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

## Autenticación

### Estrategia de autenticación

El frontend utiliza autenticación basada en JWT con localStorage.

- El backend devuelve un token JWT al hacer login.
- El token y usuario se persisten en `localStorage`.
- Las rutas privadas se protegen mediante loaders de React Router v7.
- El logout elimina token y usuario del almacenamiento local.
- Se usa **Context API** para estado global de auth (`AuthContext` + `useAuth` hook).
- Se usa **`fetch` nativo** para llamadas HTTP (consistente con el resto del proyecto).
- Login se implementa con **Action de React Router Data Mode** (consistente con `PlatoFormPage`).

### Endpoint de login

```
POST /api/usuarios/login
```

Body:
```json
{
  "legajo": "1001",
  "password": "1234"
}
```

Response:
```json
{
  "token": "...",
  "usuario": {
    "id": 1,
    "username": "Admin",
    "rol": "admin"
  }
}
```

### Flujo

1. El usuario envía el formulario `LoginPage`.
2. `loginAction` procesa el submit.
3. Se hace fetch al backend.
4. El backend devuelve JWT + usuario.
5. Se guarda `token` y `user` en localStorage.
6. Se redirige según el rol.

### Protección de rutas

`authLoader` verifica existencia del token:
- si no existe → `redirect("/login")`
- si existe → permite navegación

### Logout

- elimina `token` de localStorage
- elimina `user` de localStorage
- redirige a `/login`

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

### Estados de UI a cubrir en LoginPage

1. **Carga** → botón deshabilitado con texto "Ingresando..."
2. **Error de credenciales** → mostrar mensaje en caja roja
3. **Error de red** → "Error de conexión con el servidor"
4. **Ya autenticado** → `loginLoader` redirige a `/cocina`

---

## Reglas del proyecto

| Regla | Detalle |
|---|---|
| No eliminar imports existentes | Solo agregar los nuevos |
| No cambiar loaders/actions existentes | Solo agregar `authLoader` a rutas |
| Login fuera del AppLayout | Para que no herede la sidebar |
| Usar `localStorage` | Consistente con el uso actual en `CocinaPage.tsx` |
| No agregar dependencias npm | Todo se hace con `fetch` nativo |
| Mantener JSDoc | Cada función debe tener su `@description` |
