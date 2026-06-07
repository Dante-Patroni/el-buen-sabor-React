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
