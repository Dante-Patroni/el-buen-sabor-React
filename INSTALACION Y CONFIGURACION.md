# Frontend El Buen Sabor - Instalación y Configuración

## 📌 Requisitos Previos

Antes de comenzar, asegurarse de tener instalado:

- Node.js >= 20
- npm >= 10
- Git
- Backend del proyecto funcionando

---

# 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Dante-Patroni/el-buen-sabor-React.git
cd el-buen-sabor-React
```
2️⃣ Instalar dependencias
npm install
3️⃣ Configurar variables de entorno

Crear un archivo:

.env

En la raíz del proyecto.

Agregar:

VITE_API_URL=http://localhost:3000

⚠️ Cambiar el puerto según el backend.

Ejemplos:

VITE_API_URL=http://localhost:3000

o

VITE_API_URL=http://192.168.0.10:3000

si se conecta desde otra PC de la red.

4️⃣ Configuración necesaria del Backend

El backend debe:

Estar iniciado
Tener CORS habilitado
Tener JWT funcionando
Tener Socket.IO funcionando
Exponer las rutas API necesarias
Endpoints utilizados por el Frontend
Auth
POST /api/auth/login

Respuesta esperada:

{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "username": "admin",
    "legajo": "123",
    "rol": "admin"
  }
}

Platos
GET    /api/platos
GET    /api/platos/:id
POST   /api/platos
PUT    /api/platos/:id
POST   /api/platos/:id/imagen

Rubros
GET /api/rubros

Cocina
GET   /api/cocina/pedidos
PATCH /api/pedidos/:id/estado

5️⃣ Ejecutar el proyecto

Modo desarrollo:

npm run dev

Vite mostrará algo similar:

http://localhost:5173

Abrir esa URL en el navegador.

6️⃣ Usuarios y Roles

| Rol      | Ruta           |
| -------- | -------------- |
| admin    | /cocina/platos |
| cocinero | /cocina        |
| cajero   | /caja          |
| mozo     | /mesas         |


7️⃣ Autenticación JWT

El login:

Obtiene token JWT desde backend
Guarda token en localStorage
Todas las requests privadas usan automáticamente:
Authorization: Bearer TOKEN

mediante:

authFetch()

8️⃣ WebSockets

El monitor de cocina utiliza:

socket.io-client

El backend debe emitir eventos:

nuevo-pedido
pedido-modificado
estado-pedido-actualizado

9️⃣ Scripts útiles
Desarrollo
npm run dev
Build producción
npm run build
Preview producción
npm run preview

🔟 Tecnologías utilizadas
React
TypeScript
React Router DOM
TailwindCSS
Socket.IO Client
Vite

📌 Notas Importantes
Imágenes

Las imágenes de platos se sirven desde backend.

Ejemplo:

http://localhost:3000/uploads/platos/imagen.jpg
Seguridad

Las rutas privadas utilizan:

authLoader
JWT
authFetch

Si el token no existe:

→ redirecciona automáticamente al login

✅ Estado actual del proyecto

Implementado:

Login JWT
Protección de rutas
Roles
CRUD Platos
Subida de imágenes
Monitor de cocina en tiempo real
WebSockets
Filtros
Persistencia local temporal