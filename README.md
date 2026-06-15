# El Buen Sabor — Frontend

Sistema de gestión para el restaurante "El Buen Sabor". Esta aplicación provee las interfaces necesarias para la administración de pedidos en tiempo real, gestión de mesas (Caja), catálogo de platos y administración de usuarios, todo protegido mediante un sistema de control de acceso basado en roles (RBAC).

## Stack Tecnológico

- **React 19**
- **TypeScript**
- **Vite**
- **React Router v7 (Data Mode)**
- **Tailwind CSS v4**
- **Socket.io-client** (Comunicación en tiempo real con el backend)

## Características Principales

### 🔐 Seguridad y Autenticación (RBAC)
El sistema implementa JWT para la autenticación y un robusto control de acceso basado en roles (RBAC). Dependiendo de los permisos asignados a cada rol (ej. `superadmin`, `admin`, `cocinero`, `cajero`, `mozo`), la interfaz se adapta dinámicamente:
- **Protección de Rutas:** Interceptores de React Router (`authLoader`) y guardias de componentes (`<RequirePermiso>`).
- **Navegación Condicional:** La barra lateral solo muestra los módulos a los que el usuario tiene acceso.
- **Botones y Acciones:** Botones sensibles como "Cobrar Mesa" o "Agregar Plato" se ocultan a usuarios sin los permisos requeridos (`MESA_COBRAR`, `PLATO_CREAR`, etc.).

### 👥 Administración de Usuarios (CRUD)
Panel dedicado para superadministradores y administradores:
- Listado de usuarios activos e inactivos.
- Creación y edición de perfiles (asignación de legajo, contraseña y rol).
- Baja lógica de usuarios en lugar de eliminación física.

### 🍳 Monitor de Cocina
Panel en tiempo real conectado vía WebSockets (`socket.io`):
- Visualización de pedidos entrantes.
- Cambio de estados de pedidos (ej. de "Pendiente" a "En Preparación" o "Terminado").

### 📦 Catálogo de Platos
Módulo de administración del menú:
- Listado filtrable por rubro y estado de disponibilidad.
- Alta, baja y modificación de platos, incluyendo la carga de imágenes (`multipart/form-data`).

### 💰 Módulo de Caja
Control operativo del salón:
- Monitoreo en tiempo real del estado de las mesas.
- Emisión de tickets de consumo.
- Cobro y cierre de mesas.

## Arquitectura y Patrones

El proyecto utiliza extensivamente las nuevas características de **React Router v7 (Data Mode)**:
- **Loaders:** Para la obtención de datos (fetching) de manera asíncrona antes de renderizar la ruta.
- **Actions:** Para procesar mutaciones (crear, actualizar, borrar) enviadas mediante componentes `<Form>` nativos de react-router.
- Todo centralizado en `src/app/routes.tsx`.

## Estructura del Proyecto

```
src/
├── app/
│   └── routes.tsx          # Configuración central del router (rutas, loaders, actions)
├── auth/
│   ├── AuthContext.tsx      # Contexto global de sesión (usuario, permisos, logout)
│   ├── authService.ts       # Login/logout, persistencia de sesión en localStorage
│   ├── permisos.ts          # Constantes de códigos de permiso (RBAC)
│   ├── RequirePermiso.tsx    # Guard de permisos para rutas y elementos de UI
│   └── types.ts             # Tipos de usuario/permiso
├── components/
│   ├── layout/               # Componentes de layout de página
│   │   ├── AppLayout.tsx      # Layout raíz (Sidebar + <Outlet/>)
│   │   ├── Sidebar.tsx         # Navegación lateral filtrada por permisos
│   │   ├── PageHeader.tsx      # Encabezado de página (título + descripción + acción)
│   │   └── PageContainer.tsx   # Contenedor con padding estándar de página
│   └── ui/                    # Sistema de diseño / componentes reutilizables
│       ├── Button.tsx, card.tsx, input.tsx, label.tsx, calendar.tsx  # Base shadcn
│       ├── Heading.tsx         # Títulos h1/h2/h3 unificados
│       ├── Text.tsx            # Texto secundario (subtítulos/descripciones)
│       ├── Alert.tsx           # Mensajes de error/éxito
│       ├── Badge.tsx           # Pill de estado/rol
│       ├── Loading.tsx         # Indicador de carga
│       ├── EmptyState.tsx      # Estado vacío de página completa
│       ├── FormField.tsx       # Campo de formulario (label + input/select)
│       ├── Select.tsx          # Select estilizado para filtros
│       ├── Table.tsx           # Tabla (Table, TableHead, TableRow, TableEmptyRow)
│       └── Pagination.tsx      # Controles de paginación
├── lib/
│   ├── authFetch.ts   # fetch con header Authorization automático
│   └── utils.ts       # cn() (merge de clases Tailwind) y extractRubroId()
├── modules/cocina/    # Componentes y tipos específicos del módulo Cocina
├── pages/
│   ├── Auth/LoginPage.tsx
│   ├── Administracion/    # Gestión de usuarios (CRUD)
│   ├── Cocina/             # Monitor de cocina y catálogo de platos
│   ├── Caja/               # Gestión de mesas y cobros
│   ├── Configuracion/      # Preferencias (modo oscuro, etc.)
│   └── Errores/            # Páginas de error, acceso denegado y "próximamente"
└── types/index.ts     # Tipos de dominio (Usuario, Plato, Rubro, Rol...)
```

El sistema de diseño en `components/ui/` centraliza los patrones visuales repetidos (títulos, alertas, badges, tablas, paginación, campos de formulario, estados de carga/vacíos), evitando duplicación de JSX y manteniendo una paleta de colores consistente en toda la app (ver `INFORME_ARQUITECTURA.md` para el detalle de cada componente).

## Configuración y Ejecución

### Requisitos Previos
- Node.js (v18+)
- El [backend de El Buen Sabor](https://github.com/tu-repositorio-backend) corriendo localmente.

### Pasos
1. Clonar el repositorio.
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Crear un archivo `.env` en la raíz del proyecto configurando la URL del backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Documentación para Agentes (IA)
Si estás utilizando un agente autónomo de código (AI) para trabajar sobre este repositorio, asegúrate de indicarle que lea el archivo `AGENT.md` incluido en la raíz. Dicho documento provee el contexto arquitectónico, reglas de negocio y restricciones técnicas requeridas para mantener la consistencia del proyecto.
