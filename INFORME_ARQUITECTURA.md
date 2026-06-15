# Informe de Arquitectura — El Buen Sabor (Frontend)

Documento de estudio para defender el proyecto ante el tribunal. Explica el stack, la estructura de carpetas, el sistema de rutas/autenticación, y en detalle la refactorización de componentes reutilizables realizada.

---

## 1. Stack tecnológico

| Tecnología | Uso |
|---|---|
| **React 19** | Librería de UI |
| **TypeScript** | Tipado estático en todo el proyecto |
| **Vite** | Build tool / dev server |
| **React Router v7** (`createBrowserRouter`) | Ruteo + **loaders** (carga de datos) + **actions** (envío de formularios) |
| **Tailwind CSS v4** (`@tailwindcss/vite`) | Estilos utilitarios |
| **shadcn / @base-ui/react** | Primitivos accesibles de UI (Button, Input, Calendar) |
| **class-variance-authority (cva)** | Definición de variantes de componentes (ej. Button) |
| **clsx + tailwind-merge** (función `cn`) | Combinar y resolver conflictos de clases Tailwind |
| **socket.io-client** | Comunicación en tiempo real (Cocina y Caja) |
| **lucide-react** | Íconos SVG |

Comandos:
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

---

## 2. Estructura de carpetas

```
src/
├── app/
│   └── routes.tsx          # Definición central del router (rutas, loaders, actions)
├── auth/
│   ├── AuthContext.tsx      # Contexto global de sesión (user, permisos, logout)
│   ├── authService.ts       # login/logout/token, persistencia en localStorage
│   ├── permisos.ts          # Constantes de códigos de permiso (RBAC)
│   ├── RequirePermiso.tsx    # Componente guard de permisos
│   └── types.ts             # Tipos de usuario/permiso
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     # Layout raíz (Sidebar + <Outlet/>)
│   │   ├── Sidebar.tsx        # Navegación lateral con permisos
│   │   ├── PageHeader.tsx     # 🆕 Encabezado de página (título + descripción + acción)
│   │   └── PageContainer.tsx  # 🆕 Wrapper con padding estándar (p-6)
│   └── ui/
│       ├── Button.tsx, card.tsx, input.tsx, label.tsx, calendar.tsx   # shadcn (preexistentes)
│       ├── Heading.tsx   # 🆕 h1/h2/h3 unificados
│       ├── Text.tsx      # 🆕 Texto secundario
│       ├── Alert.tsx     # 🆕 Mensajes de error/éxito
│       ├── Badge.tsx     # 🆕 Pill de estado/rol
│       ├── Loading.tsx   # 🆕 Indicador de carga
│       ├── EmptyState.tsx# 🆕 Estado vacío de página completa
│       ├── FormField.tsx # 🆕 Campo de formulario (label + input/select)
│       ├── Select.tsx    # 🆕 Select estilizado (filtros)
│       ├── Table.tsx     # 🆕 Tabla (Table, TableHead, TableRow, TableEmptyRow)
│       └── Pagination.tsx# 🆕 Controles de paginación
├── lib/
│   ├── authFetch.ts   # fetch con header Authorization automático
│   └── utils.ts       # cn() y extractRubroId()
├── modules/cocina/    # Componentes y tipos específicos del módulo Cocina (Column, PedidoCard)
├── pages/
│   ├── Auth/LoginPage.tsx
│   ├── Administracion/ (UsuariosPage, UsuarioFormPage)
│   ├── Cocina/ (CocinaPage, PlatosPage, PlatoFormPage)
│   ├── Caja/CajaPage.tsx
│   ├── Configuracion/ConfigPage.tsx
│   └── Errores/ (ErrorPage, AccesoDenegado, Proximamente)
└── types/index.ts     # Tipos de dominio (Usuario, Plato, Rubro, Rol...)
```

🆕 = componentes creados en la refactorización de componentización.

---

## 3. Sistema de rutas (`src/app/routes.tsx`)

Se usa `createBrowserRouter` con **loaders** (cargan datos antes de renderizar) y **actions** (procesan envíos de `<Form>`).

### 3.1 Estructura general
- Ruta pública: `/login` → `LoginPage` (con `loginLoader` y `loginAction`).
- Resto de rutas: envueltas en un nodo padre con `element: <AppLayout />` y `loader: authLoader`.
  - `AppLayout` renderiza `Sidebar` + `<Outlet />`.
  - `authLoader` verifica que exista un token (`getToken()`); si no, `redirect("/login")`.

### 3.2 Loaders y Actions por página

| Ruta | Loader | Action | Notas |
|---|---|---|---|
| `/` | `rootLoader` | — | Redirige según rol (`getHomeByRole`) |
| `/cocina` | — | — | Monitor en tiempo real (socket.io) |
| `/cocina/platos` | `platosLoader` | — | Trae platos y normaliza `rubroId` con `extractRubroId` |
| `/cocina/platos/nuevo` | — | `crearPlatoAction` | Crea plato + sube imagen (multipart) |
| `/cocina/platos/:id` | `platoLoader` | `editarPlatoAction` | Edita plato + sube imagen |
| `/administracion/usuarios` | `usuariosLoader` | — | Lista de usuarios |
| `/administracion/usuarios/nuevo` | `usuarioFormLoader` | `crearUsuarioAction` | Roles hardcodeados (`ROLES_HARDCODED`) |
| `/administracion/usuarios/:id` | `usuarioFormLoader` | `editarUsuarioAction` | Si `password` viene vacío, no se envía |
| `/caja` | — | — | Tiempo real vía socket.io |
| `/configuracion` | — | — | Toggle de modo oscuro |

### 3.3 Protección por permisos
Cada ruta protegida envuelve su `element` con:
```tsx
<RequirePermiso permisos={[...]} fallback={<AccesoDenegado />}>
  <PaginaX />
</RequirePermiso>
```
`RequirePermiso` (en `src/auth/RequirePermiso.tsx`) usa `useAuth().tieneAlgunPermiso(...)` — si el usuario **no tiene ninguno** de los permisos listados, renderiza el `fallback` (por defecto `null`).

---

## 4. Autenticación y RBAC (Control de Roles y Permisos)

### 4.1 Flujo de login
1. `LoginPage` envía un `<Form method="post">` (legajo + password) → `loginAction`.
2. `loginAction` llama a `authService.login()` → `POST /api/usuarios/login`.
3. Si es exitoso: `saveAuth(token, usuario)` guarda `token` y `user` en `localStorage` y dispara el evento global `authChange`.
4. Redirección según rol con `getHomeByRole(rol)`:
   - `superadmin` / `admin` → `/cocina/platos`
   - `cocinero` → `/cocina`
   - `cajero` → `/caja`
   - `mozo` → `/mesas`

### 4.2 AuthContext (`src/auth/AuthContext.tsx`)
- Estado `user` inicializado desde `localStorage` (`getStoredUser`).
- Escucha el evento `authChange` (disparado por `saveAuth`/`logout`) para resincronizar el estado entre componentes que no comparten árbol de render.
- Expone:
  - `isAuthenticated`
  - `logout()`
  - `tienePermiso(codigo)`
  - `tieneAlgunPermiso(...codigos)` → usado por `RequirePermiso` y por la `Sidebar` para mostrar/ocultar enlaces.

### 4.3 Permisos (`src/auth/permisos.ts`)
Constantes de string (`PLATO_CREAR`, `USUARIO_VER`, `MESA_COBRAR`, etc.) centralizadas para autocompletado y para evitar errores de tipeo al usarlas en `RequirePermiso`.

### 4.4 authFetch (`src/lib/authFetch.ts`)
Wrapper sobre `fetch` que:
- Toma `VITE_API_URL` del `.env`.
- Agrega automáticamente `Authorization: Bearer <token>` si existe token en `localStorage`.
- Se usa en **todos** los loaders/actions y en los `fetch` manuales (CajaPage, CocinaPage, UsuariosPage, etc.) — único punto de entrada hacia el backend.

---

## 5. Sistema de diseño / Componentización (lo nuevo)

### 5.1 Motivación
Antes de la refactorización, cada página tenía su propia paleta de colores para títulos (stone-900, yellow-700, orange-900, gray-800) y repetía el mismo JSX para: encabezados de página, cajas de error/éxito, tablas, paginación, badges de estado, campos de formulario y estados de carga.

**Objetivo:** extraer esos patrones a componentes reutilizables con props tipadas, sin tocar lógica de negocio, rutas ni llamadas a API. Como efecto secundario se unificó el color de los **títulos** a `text-stone-900` (antes mezclados).

### 5.2 Componentes nuevos — API y uso

#### `ui/Heading.tsx`
```tsx
<Heading as="h1" className="opcional">Texto</Heading>
```
- `as`: `"h1" | "h2" | "h3"` (default `"h1"`).
- Estilos: h1 = `text-3xl font-bold`, h2 = `text-2xl font-semibold`, h3 = `text-lg font-semibold`, todos en `text-stone-900`.
- `className` se combina con `cn()` (tailwind-merge), permite sobrescribir tamaño/color puntualmente (ej. `PlatoFormPage` usa `className="text-3xl font-extrabold"` sobre un `h2`).

#### `ui/Text.tsx`
```tsx
<Text className="opcional">Subtítulo o descripción</Text>
```
- `<p className="text-sm text-stone-600">` reutilizable. Usado dentro de `PageHeader`.

#### `ui/Alert.tsx`
```tsx
<Alert variant="error" | "success" className="opcional">{mensaje}</Alert>
```
- `error` (default): rojo — `border-red-200 bg-red-50 text-red-700`.
- `success`: verde — `border-green-200 bg-green-50 text-green-700`.
- Reemplaza las cajas de error duplicadas en `UsuariosPage`, `UsuarioFormPage`, `CajaPage`, `PlatoFormPage`.

#### `ui/Badge.tsx`
```tsx
<Badge className="bg-green-100 text-green-800">Activo</Badge>
```
- Solo centraliza la "forma" (`rounded-full px-2.5 py-1 text-xs font-semibold uppercase`); el color semántico se pasa por `className` para no perder la lógica condicional existente (rol, activo/inactivo).
- Usado en `UsuariosPage` para badges de **rol** y **estado**.

#### `ui/Loading.tsx`
```tsx
<Loading label="Cargando mesas..." className="opcional" />
```
- Ícono `sync` animado + texto. Reemplaza los distintos "Cargando..." de `CajaPage` y `CocinaPage`.

#### `ui/EmptyState.tsx`
```tsx
<EmptyState icon={<...>} title="..." description="..." action={<Link>...</Link>} />
```
- Estado vacío de página completa (icono opcional + título `h2` + descripción + acción).
- Usado en `AccesoDenegado` y `Proximamente`.

#### `ui/FormField.tsx` (incluye `FormSelect` y constantes `FIELD_STYLES`/`LABEL_STYLES`)
```tsx
<FormField label="Nombre" id="nombre" name="nombre" required defaultValue={...} />
<FormSelect label="Rol" id="rolId" name="rolId" required defaultValue={...}>
  <option value="">Seleccione un rol</option>
  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
</FormSelect>
```
- Reemplaza el bloque repetido `<div className="space-y-2"><label>...</label><input className="w-full rounded-xl border ..."/></div>` de `UsuarioFormPage`.
- Si `required` es `true`, el label agrega automáticamente un `" *"` (igual que el markup original).

#### `ui/Select.tsx`
```tsx
<Select value={...} onChange={...}>...</Select>
```
- Select estilizado sin label, para filtros (usado en `PlatosPage`, que antes tenía `<select>` sin clases).

#### `ui/Table.tsx`
```tsx
<Table>
  <TableHead>
    <th>Columna 1</th>
    <th>Columna 2</th>
  </TableHead>
  <tbody>
    <TableRow onClick={...}>
      <td>...</td>
    </TableRow>
    {rows.length === 0 && <TableEmptyRow colSpan={N} message="No se encontraron..." />}
  </tbody>
</Table>
```
- `Table`: wrapper `<div className="overflow-x-auto"><table className="w-full text-left">`.
- `TableHead`: `<thead><tr className="border-b ... text-xs uppercase text-stone-500">`.
- `TableRow`: `<tr className="border-b ... hover:bg-stone-50">`, acepta `onClick` opcional (usado en `PlatosPage` para navegar al hacer click en la fila).
- `TableEmptyRow`: fila "No se encontraron resultados" con `colSpan` configurable.

#### `ui/Pagination.tsx`
```tsx
<Pagination page={paginaActual} totalPages={totalPaginas} onPageChange={setPagina} />
```
- Controles "anterior / números / siguiente" extraídos de `UsuariosPage`. La lógica de paginación (slice del array, cálculo de `totalPaginas`) **sigue en la página**, el componente solo renderiza los controles.

#### `layout/PageHeader.tsx`
```tsx
<PageHeader title="Gestión de Usuarios" description="..." action={<Button>Agregar</Button>} />
```
- Combina `Heading` (h1) + `Text` + un slot `action` a la derecha, en un `flex` responsive (`flex-col` en mobile, `flex-row` en `sm:`).

#### `layout/PageContainer.tsx`
```tsx
<PageContainer className="p-8">...</PageContainer>
```
- Wrapper `<div className="p-6">`, con `className` para sobrescribir el padding cuando una página lo necesita (ej. `CajaPage` usa `p-8`).

### 5.3 Tabla de equivalencias (antes → ahora)

| Patrón repetido (antes) | Componente nuevo |
|---|---|
| `<div className="p-6">` | `PageContainer` |
| `<h1 className="text-3xl font-bold ...">` + `<p className="text-sm text-stone-600">` + botón de acción | `PageHeader` |
| `<h1>/<h2>/<h3>` sueltos con colores distintos | `Heading` |
| `<p className="text-sm text-stone-600">` | `Text` |
| `<div className="rounded-2xl border border-red-200 bg-red-50 ...">` | `Alert` |
| `<span className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${color}">` | `Badge` |
| `<div>Cargando...</div>` con spinner | `Loading` |
| Página de error/vacío con icono + texto + link | `EmptyState` |
| `<div className="space-y-2"><label>...</label><input className="...">` | `FormField` / `FormSelect` |
| `<select>` sin estilo | `Select` |
| `<table>/<thead>/<tbody>/<tr>` repetidos | `Table`, `TableHead`, `TableRow`, `TableEmptyRow` |
| Botones prev/next/números de paginación | `Pagination` |

---

## 6. Páginas — resumen funcional

### `LoginPage`
Formulario público (`legajo` + `password`) vía `<Form method="post">` → `loginAction`. Diseño con fondo oscuro/imagen (no se tocó, es un estilo intencionalmente distinto al resto del sistema).

### `UsuariosPage`
- Lista usuarios (loader `usuariosLoader`).
- Filtros locales: búsqueda por texto, por rol (multi-selección), por estado (activo/inactivo).
- Paginación local (`PAGE_SIZE = 8`).
- Acciones protegidas por permisos: crear (`USUARIO_CREAR`), editar (`USUARIO_MODIFICAR`), dar de baja (`USUARIO_ELIMINAR` + `authFetch DELETE`).
- Usa: `PageContainer`, `PageHeader`, `Alert`, `Badge`, `Table`/`TableHead`/`TableRow`/`TableEmptyRow`, `Pagination`.

### `UsuarioFormPage`
- Crear/editar usuario vía `<Form method={post|put}>`.
- Si `usuario` viene del loader → modo edición (`isEditing`).
- Toggle mostrar/ocultar contraseña.
- Usa: `Heading`, `Alert`, `FormField`, `FormSelect`.

### `PlatosPage`
- Lista platos (loader `platosLoader`, normaliza `rubroId`).
- Filtros por categoría (rubro/subrubro, fetch propio a `/api/rubros`) y por estado.
- Métricas simples (total platos, disponibles).
- Click en fila → navega a edición, pasando `rubroId`/`rubroDenominacion` por `state` de navegación.
- Usa: `PageContainer`, `PageHeader`, `Select`, `Table`/`TableHead`/`TableRow`.

### `PlatoFormPage`
- Formulario complejo: dos columnas (form + preview), subida de imagen (`multipart/form-data`), toggles de "activo"/"menú del día"/"stock ilimitado", selector de fecha (`Calendar`).
- Mantiene su estilo propio (panel de preview oscuro con acento naranja) — **se tocó solo el título (`Heading`) y la caja de error (`Alert`)**, por ser el cambio de menor riesgo dado que esta página tiene mucho estado controlado (`useState`/`useEffect`).

### `CocinaPage`
- Monitor en tiempo real con `socket.io-client`: eventos `nuevo-pedido`, `pedido-estado-actualizado`, `pedido-modificado`.
- Persiste pedidos en `localStorage` para no perderlos al navegar.
- Columnas por estado (`nuevo`, `preparacion`, `listo`) vía `modules/cocina/components/Column.tsx`.
- Usa: `Heading` (título), `Loading` (estado de carga inicial).

### `CajaPage`
- Selección de mesa "esperando cobro", generación de ticket de cierre, cobro.
- `socket.io-client`: eventos `ticket-generado`, `mesa-esperando-cobro`. Usa un `useRef` (`selectedMesaRef`) para evitar recrear el socket cuando cambia la mesa seleccionada (evita stale closures).
- Usa: `PageContainer`, `PageHeader`, `Alert` (error/success), `Loading`.

### `ConfigPage`
- Toggle de modo oscuro persistido en `localStorage`, agrega/quita la clase `dark` en `document.documentElement`.
- Usa: `PageContainer`, `Heading`.

### Páginas de error
- `ErrorPage`: `errorElement` de las rutas — distingue `isRouteErrorResponse` (errores HTTP del router) de errores JS genéricos. Envuelta en `PageContainer`.
- `AccesoDenegado`: `fallback` de `RequirePermiso` cuando el usuario no tiene permisos. Usa `EmptyState`.
- `Proximamente`: placeholder para funcionalidades no implementadas. Usa `EmptyState`.

---

## 7. Convenciones de estilo

- **Tailwind v4** importado vía `@import "tailwindcss"` en `src/index.css`, con tema shadcn (`@import "shadcn/tailwind.css"`) y variables CSS (`--primary`, `--destructive`, etc. en formato `oklch`).
- **`cn()`** (`src/lib/utils.ts`) = `twMerge(clsx(inputs))`. Se usa en **todos** los componentes nuevos para que un `className` pasado por props pueda sobrescribir clases por defecto sin conflictos (ej. `text-3xl` sobrescribe `text-2xl`).
- **Paleta unificada de títulos**: `text-stone-900` (antes: stone-900 / yellow-700 / orange-900 / gray-800 mezclados).
- **Color de acento principal**: `red-800` / `red-900` (botones primarios de Administración) y `orange` (Cocina/Caja) — se mantuvieron los colores funcionales/semánticos (error=rojo, éxito=verde, advertencia=ámbar).
- **Componentes shadcn preexistentes** (`Button`, `Input`, `Label`, `Card`, `Calendar`) no se modificaron — son la base sobre la que se construyeron los nuevos.

---

## 8. Preguntas frecuentes para la defensa

**¿Por qué un componente `Heading` con prop `as` en vez de `H1`, `H2`, `H3` separados?**
Porque los tres tamaños comparten la misma "familia" visual (tipografía, color) y solo cambia tamaño/peso — un único componente con `as` evita triplicar el archivo y permite cambiar el estilo de todos los títulos del sistema en un solo lugar.

**¿Por qué `Badge` no define los colores?**
Porque el color depende de lógica de negocio (rol del usuario, estado activo/inactivo, etc.) que ya existía en cada página (`ROL_BADGE_STYLES`, condicionales). Centralizar solo la "forma" (pill, padding, tipografía) evita duplicar esas ~10 líneas de CSS sin tener que reescribir la lógica condicional.

**¿Por qué `PlatoFormPage` no se refactorizó tanto como `UsuarioFormPage`?**
Tiene un diseño visual propio (panel de previsualización oscuro, inputs con borde inferior en vez de caja) y mucho estado controlado con `useState`/`useEffect` para sincronizar con el loader. Forzar el mismo `FormField` que en Usuarios habría cambiado su identidad visual y aumentado el riesgo de romper el flujo de edición. Se aplicaron solo los cambios de bajo riesgo (título, alerta de error).

**¿Qué garantiza que no se rompió nada?**
- `npx tsc -b --noEmit` sin errores (tipado estricto end-to-end).
- `npm run build` exitoso (mismo tamaño de bundle aproximado).
- `npm run lint`: mismos 23 problemas preexistentes que antes de la refactorización (verificado con `git stash`), cero nuevos.
- Ningún cambio en loaders, actions, `authFetch`, `AuthContext`, `permisos.ts` ni `routes.tsx`.

**¿Qué patrón de arquitectura general sigue el proyecto?**
- **Feature-based pages** (`pages/<Modulo>/...`) + **rutas centralizadas con loaders/actions** (patrón "Remix-like" de React Router v7) → separa *fetching* (loader) de *presentación* (componente) y de *mutaciones* (action).
- **RBAC declarativo**: permisos como constantes + componente `RequirePermiso` que decide render condicional, tanto a nivel de rutas como de botones individuales.
- **Design system incremental**: en vez de adoptar una librería externa nueva, se construyó un sistema mínimo de componentes (`ui/`) sobre la base ya existente (shadcn + `cn()`), siguiendo el mismo patrón de props tipadas y `cva`/`cn` que ya usaba `Button.tsx`.
