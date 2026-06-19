# Defensa del Proyecto — El Buen Sabor (Frontend React)

> Guía de estudio para presentación ante tribunal.  
> Fecha: Junio 2026

---

## 1. ¿Qué es el proyecto? (Resumen ejecutivo de 30 segundos)

**El Buen Sabor** es una aplicación web de gestión interna para un restaurante. Permite que distintos empleados (cocineros, cajeros, mozos, administradores) accedan a las herramientas que corresponden a su rol: el cocinero ve los pedidos en tiempo real, el cajero cobra las mesas, el admin gestiona el menú y los usuarios.

- **Tecnología:** React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS
- **Comunicación:** API REST (fetch con JWT) + WebSocket (Socket.io para cocina)
- **Autenticación:** JWT en localStorage + sistema RBAC con permisos granulares
- **Estado:** Context API para auth, loaders/actions de React Router para datos

---

## 2. Arquitectura del proyecto

```
src/
├── app/routes.tsx         → Router central: rutas, loaders y actions
├── auth/                  → Sistema de autenticación y permisos
│   ├── AuthContext.tsx     → Estado global de sesión (Provider + useAuth hook)
│   ├── authService.ts     → login(), logout(), getToken(), saveAuth()
│   ├── permisos.ts        → Constantes de permisos (PLATO_CREAR, USUARIO_VER…)
│   └── RequirePermiso.tsx → Guard: renderiza hijos solo si tiene el permiso
├── components/
│   ├── Administracion/    → Componentes específicos (ej. UsuariosTable)
│   ├── layout/            → AppLayout, Sidebar
│   └── ui/                → Átomos: Button, Input, Select, Card, Label
├── lib/
│   ├── api/               → Una función por operación, agrupadas por entidad
│   │   ├── platos.api.ts  → getPlatos(), createPlato(), updatePlato()…
│   │   └── usuarios.api.ts→ getUsuarios(), deleteUsuario()…
│   ├── authFetch.ts       → Wrapper de fetch: agrega JWT automáticamente
│   ├── mappings.ts        → ROL_BADGE_STYLES, ROLES_HARDCODED, helpers
│   └── utils.ts           → cn(), flattenRubros(), extractRubroId()
├── modules/cocina/        → Módulo autocontenido del monitor de cocina
├── pages/                 → Una carpeta por sección de la app
└── types/                 → Interfaces divididas por entidad + barrel index.ts
```

**Por qué esta estructura:** cada carpeta tiene una responsabilidad clara. Si hay un bug en una llamada a la API, se busca en `lib/api/`. Si hay un problema de permisos, se busca en `auth/`. Esto se llama **separación de responsabilidades**.

---

## 3. Conceptos clave — lo que el tribunal puede preguntar

### 3.1 React Router Data Mode (loaders y actions)

En lugar del patrón clásico `useEffect + fetch` dentro del componente, este proyecto usa **Data Mode de React Router v7**, donde los datos viven en el router.

**Loader** — carga datos *antes* de renderizar el componente:
```tsx
// En routes.tsx
const platosLoader = async () => getPlatos(); // llama a lib/api/

// En el componente
const platos = useLoaderData() as Plato[];  // ya llegaron, sin loading spinner
```

**Action** — procesa el submit de un formulario:
```tsx
// El formulario usa <Form> de react-router-dom, no <form> nativo
<Form method="post">
  <input name="nombre" />
  <Button type="submit">Guardar</Button>
</Form>

// El action recibe los datos
const crearPlatoAction = async ({ request }) => {
  const formData = await request.formData();
  const res = await createPlato({ nombre: formData.get("nombre") });
  if (!res.ok) return { error: "Error al crear" };
  return redirect("/cocina/platos");
};
```

**Ventaja:** los componentes quedan limpios, sin lógica de fetch ni estados de carga manuales.

---

### 3.2 Autenticación JWT + RBAC

**Flujo de login:**
1. El usuario envía legajo + contraseña desde `LoginPage`.
2. `loginAction` llama a `authService.login()`.
3. El backend devuelve `{ token, usuario }`.
4. `saveAuth()` guarda ambos en `localStorage` y dispara el evento `authChange`.
5. `AuthProvider` escucha el evento y actualiza el estado global con el usuario.
6. `getHomeByRole()` redirige al usuario a su pantalla según su rol.

**¿Por qué localStorage?** Es la opción más simple para persistir sesión entre recargas. La alternativa (cookies httpOnly) requiere configuración del servidor. Para el alcance del proyecto, localStorage es suficiente.

**RBAC (Role-Based Access Control):**
- Cada usuario tiene un array `permisos[]` que llega del backend: `["PLATO_CREAR", "PLATO_MODIFICAR", "USUARIO_VER"]`.
- Las constantes en `permisos.ts` evitan errores de tipeo: `PLATO_CREAR` en lugar del string literal.
- `RequirePermiso` es un *guard component*: solo renderiza sus hijos si el usuario tiene al menos uno de los permisos requeridos.

```tsx
// Oculta el botón si no tiene permiso USUARIO_CREAR
<RequirePermiso permisos={[USUARIO_CREAR]}>
  <Button>Agregar Usuario</Button>
</RequirePermiso>

// Redirige a pantalla de acceso denegado
<RequirePermiso permisos={[MESA_VER]} fallback={<AccesoDenegado />}>
  <CajaPage />
</RequirePermiso>
```

**¿Por qué permisos y no solo roles?** Con roles, si mañana quieren darle a un cajero la posibilidad de ver platos pero no modificarlos, tendrían que crear un rol nuevo. Con permisos granulares, solo se agrega `PLATO_VER` al cajero desde la base de datos, sin tocar el código.

---

### 3.3 authFetch — el wrapper de fetch

```ts
// lib/authFetch.ts
export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_URL}${endpoint}`, { ...options, headers });
};
```

**Por qué existe:** sin este wrapper, cada llamada a la API tendría que repetir la lógica de agregar el header `Authorization: Bearer <token>`. Centraliza eso en un solo lugar. Si mañana cambia la forma de autenticar, se modifica un solo archivo.

---

### 3.4 Context API para estado global de auth

`AuthProvider` envuelve toda la app y comparte:
- `user` — objeto con nombre, rol y permisos
- `isAuthenticated` — booleano
- `logout()` — limpia localStorage y actualiza estado
- `tienePermiso(codigo)` — verifica un permiso específico
- `tieneAlgunPermiso(...codigos)` — verifica OR entre permisos

**useMemo y useCallback:** el valor del contexto y las funciones se memorizan para no causar re-renders innecesarios en todos los componentes que consumen el contexto.

```tsx
// Cualquier componente puede acceder a la sesión:
const { user, logout, tienePermiso } = useAuth();
```

---

### 3.5 Componentes UI — sistema de diseño

Los componentes base (`Button`, `Input`, `Select`) están en `src/components/ui/`. Todos usan **@base-ui/react** (primitivos accesibles) + **CVA (Class Variance Authority)** para las variantes.

**¿Por qué no usar `<button>` directo?**
```tsx
// ❌ Sin componente: se repite el estilo en cada lugar, difícil de mantener
<button className="rounded-lg bg-red-800 px-4 py-2 text-white hover:bg-red-900">Guardar</button>

// ✅ Con componente: estilo centralizado, variantes controladas
<Button variant="default">Guardar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="destructive" size="sm">Eliminar</Button>
```

Si el día de mañana quieren cambiar el color primario de toda la app, cambian una línea en `Button.tsx`.

**CVA** permite definir variantes de forma declarativa:
```ts
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "bg-primary...", outline: "border...", destructive: "bg-red..." },
    size:    { sm: "h-7...", default: "h-8...", lg: "h-9..." },
  }
})
```

---

### 3.6 TypeScript — tipos e interfaces

**¿Por qué TypeScript?** Detecta errores en tiempo de desarrollo, antes de ejecutar el código. El editor autocompletea los campos disponibles de un objeto.

```ts
// Sin TypeScript: ¿qué campos tiene un plato? No se sabe hasta runtime
const plato = await res.json();
console.log(plato.nmbre); // error de tipeo — pasa desapercibido

// Con TypeScript: el editor lo detecta antes de ejecutar
const plato: Plato = await res.json();
console.log(plato.nmbre); // ❌ Error: Property 'nmbre' does not exist on type 'Plato'
```

**Estructura de tipos del proyecto:**
```
src/types/
├── plato.types.ts    → interface Plato, interface Rubro
├── usuario.types.ts  → interface Usuario, interface Rol
├── pedido.types.ts   → interface Pedido, interface ItemPedido
└── index.ts          → re-exporta todo (barrel)
```

**Barrel export:** permite importar desde una sola ruta sin importar el archivo interno:
```ts
// ✅ Simple
import type { Usuario, Plato } from "@/types";

// ❌ Sin barrel: hay que saber en qué archivo está cada tipo
import type { Usuario } from "@/types/usuario.types";
import type { Plato } from "@/types/plato.types";
```

---

### 3.7 Monitor de Cocina — tiempo real con Socket.io

`CocinaPage` se conecta al backend mediante **WebSocket** (Socket.io):
- El backend emite eventos cuando llega un nuevo pedido o cambia de estado.
- El frontend escucha esos eventos y actualiza la UI sin necesidad de recargar.

```ts
// Conexión
const socket = io(SOCKET_URL, { auth: { token } });

// Escuchar eventos del backend
socket.on("nuevoPedido", (pedido) => {
  setPedidos(prev => [...prev, pedido]);
});

socket.on("estadoPedido", (actualizado) => {
  setPedidos(prev => prev.map(p => p.id === actualizado.id ? actualizado : p));
});
```

**¿Diferencia entre HTTP y WebSocket?** HTTP es de ida y vuelta: el cliente pregunta, el servidor responde. WebSocket mantiene una conexión abierta bidireccional: el servidor puede enviar datos al cliente cuando quiera, sin que el cliente los pida.

---

### 3.8 Capa de API — lib/api/

Antes de las correcciones del profe, los endpoints estaban hardcodeados en `routes.tsx`:
```ts
// ❌ Antes: endpoint directo en el loader
const res = await authFetch("/api/platos");
```

Después de las correcciones, hay funciones dedicadas por entidad:
```ts
// ✅ Después: función en lib/api/platos.api.ts
export const getPlatos = async (): Promise<Plato[]> => {
  const res = await authFetch("/api/platos");
  if (!res.ok) throw new Error("Error al cargar los platos");
  return res.json().then(platos => platos.map(p => ({ ...p, rubroId: extractRubroId(p) })));
};

// routes.tsx queda limpio:
const platosLoader = async () => getPlatos();
```

**Ventaja:** si el endpoint cambia (ej. el backend pasa de `/api/platos` a `/v2/menu`), se modifica en un solo archivo, no en todos los loaders y actions.

---

## 4. Flujos completos para explicar en la defensa

### Flujo: Usuario entra a la app

```
1. Navega a /
2. rootLoader(): verifica token en localStorage
3. Si no hay token → redirect("/login")
4. Si hay token → getHomeByRole(user.rol) → redirect según rol:
   - superadmin/admin → /cocina/platos
   - cocinero         → /cocina
   - cajero           → /caja
   - mozo             → /mesas
```

### Flujo: Crear un usuario nuevo

```
1. Admin navega a /administracion/usuarios/nuevo
2. authLoader() verifica token ✓
3. RequirePermiso([USUARIO_CREAR]) verifica permiso ✓
4. usuarioFormLoader() carga la lista de roles
5. Se renderiza UsuarioFormPage con el formulario vacío
6. Admin completa el form y hace submit → <Form method="post">
7. crearUsuarioAction() recibe formData
8. Llama a createUsuario(payload) → POST /api/usuarios con JWT
9. Si res.ok → redirect("/administracion/usuarios")
10. Si !res.ok → return { error } → useActionData() lo muestra en la UI
```

### Flujo: Cocinero cambia estado de un pedido

```
1. Cocinero está en /cocina (CocinaPage)
2. Socket.io escucha "nuevoPedido" → aparece PedidoCard nuevo
3. Cocinero hace click en "Empezar"
4. onCambiarEstado(id, "preparacion") → authFetch PUT /api/pedidos/:id
5. Backend cambia estado en DB y emite "estadoPedido" por WebSocket
6. Todos los clientes conectados reciben el evento y actualizan su UI
```

---

## 5. Preguntas típicas del tribunal y cómo responderlas

**P: ¿Por qué eligieron React y no Angular o Vue?**
> React tiene mayor adopción en el mercado, gran ecosistema de librerías, y en la materia fue el framework enseñado. La curva de aprendizaje es razonable y la comunidad es enorme.

**P: ¿Qué es un componente en React?**
> Una función de JavaScript que recibe `props` y devuelve JSX (la descripción de la UI). React se encarga de renderizarlo en el DOM real. Cuando cambia su estado o sus props, React re-renderiza solo esa parte, no toda la página.

**P: ¿Qué diferencia hay entre state y props?**
> `props` son datos que vienen del componente padre (solo lectura). `state` es el estado interno del componente, que el mismo componente puede modificar con `useState`. Cuando el estado cambia, el componente se re-renderiza.

**P: ¿Por qué usaron Context API y no Redux?**
> Redux es ideal para apps con estado global complejo y muchas actualizaciones. En este proyecto, el único estado verdaderamente global es la sesión del usuario (auth). Context API es más simple y suficiente para ese caso. No tenemos un store con 20 slices.

**P: ¿Qué hace `useMemo`?**
> Memoriza el resultado de un cálculo para no recalcularlo en cada render. En `AuthContext`, el valor del contexto se memoriza con `useMemo` para no crear un objeto nuevo en cada render (lo que causaría que todos los consumidores del contexto se re-rendericen innecesariamente).

**P: ¿Qué hace `useCallback`?**
> Similar a `useMemo` pero para funciones. `tienePermiso` y `tieneAlgunPermiso` están en `useCallback` para mantener la misma referencia de función entre renders, lo que es importante cuando se pasan como dependencias a otros hooks.

**P: ¿Qué es un custom hook?**
> Una función que empieza con `use` y puede llamar otros hooks de React. `useAuth()` es un custom hook que consume `AuthContext`. Permite compartir lógica entre componentes sin duplicar código.

**P: ¿Cómo protegen las rutas de usuarios no autenticados?**
> Con `authLoader` en React Router. Antes de renderizar cualquier ruta protegida, el loader verifica si hay un token en localStorage. Si no hay → redirige a `/login`. Si hay → permite continuar. Además, el backend valida el JWT en cada request, así que aunque alguien manipule localStorage, el backend rechazaría las peticiones.

**P: ¿Qué pasa si el token vence?**
> El backend devuelve 401. El frontend recibe `res.ok === false` y puede manejarlo. En la versión actual, el usuario vería un mensaje de error. Una mejora podría ser interceptar el 401 en `authFetch` y redirigir automáticamente a `/login`.

**P: ¿Qué es TypeScript? ¿Por qué lo usaron?**
> TypeScript es JavaScript con tipado estático. Permite definir la forma (shape) de los datos de antemano. El compilador detecta errores de tipos antes de ejecutar el código, lo que reduce bugs en producción y mejora la experiencia de desarrollo con autocompletado.

**P: ¿Qué diferencia hay entre `interface` y `type` en TypeScript?**
> Ambos definen la forma de un objeto. `interface` es extensible (se puede declarar dos veces y se fusionan). `type` es más flexible (permite uniones, intersecciones, tipos primitivos). Para objetos de dominio como `Plato` o `Usuario`, usamos `interface` por convención.

**P: ¿Qué es un barrel export?**
> Un archivo `index.ts` que re-exporta todo lo de una carpeta. Permite importar desde `@/types` en lugar de saber exactamente en qué archivo está cada cosa. Facilita el refactor: si movés un tipo de archivo, solo cambia el barrel.

**P: ¿Por qué separaron los tipos en archivos distintos?**
> Para organizar el código por entidades de negocio. Si todo está en un solo archivo `index.ts`, se vuelve difícil de mantener a medida que crece el proyecto. Separado en `plato.types.ts`, `usuario.types.ts`, `pedido.types.ts`, cada archivo tiene una sola responsabilidad.

**P: ¿Qué es Tailwind CSS?**
> Un framework de CSS utility-first. En lugar de escribir clases CSS personalizadas, se usan clases predefinidas directamente en el HTML: `rounded-xl`, `bg-red-800`, `flex items-center`. Ventaja: no hay que nombrar clases, no hay CSS global que colisione. Desventaja: el JSX puede verse verboso.

**P: ¿Qué es Vite?**
> El bundler y servidor de desarrollo. Reemplaza a Create React App. Es mucho más rápido porque usa ES Modules nativos del browser en desarrollo (sin bundling completo) y Rolldown para producción. El `npm run build` genera los archivos estáticos optimizados.

**P: ¿Cómo funciona el tiempo real en el monitor de cocina?**
> Socket.io mantiene una conexión WebSocket persistente entre el cliente y el servidor. Cuando el backend detecta un nuevo pedido o un cambio de estado, emite un evento por el socket. El cliente escucha ese evento y actualiza el estado local, lo que dispara un re-render con los nuevos datos. Todo sin polling (consultas periódicas).

**P: ¿Qué correcciones hicieron al proyecto?**
> El profe señaló 6 áreas de mejora que implementamos:
> 1. **Normalización de componentes**: reemplazamos `<input>`, `<button>` y `<select>` crudos con los componentes del sistema (`Input`, `Button`, `Select`), para consistencia y menor duplicación de estilos.
> 2. **Mappings centralizados**: movimos `ROL_BADGE_STYLES` y `ROLES_HARDCODED` a `lib/mappings.ts`, y la lógica de flatten de rubros (que estaba duplicada en dos páginas) a `lib/utils.ts`.
> 3. **Types por entidad**: en lugar de tener todos los tipos en un solo archivo, los separamos en `plato.types.ts`, `usuario.types.ts`, `pedido.types.ts`.
> 4. **ErrorPage con ternarios**: simplificamos dos bloques `return` casi idénticos en uno solo con ternarios condicionales.
> 5. **Capa de API**: creamos `lib/api/platos.api.ts` y `lib/api/usuarios.api.ts` para encapsular los endpoints. Los loaders y actions ahora llaman a esas funciones en lugar de usar `authFetch` directamente.
> 6. **Componentización**: extrajimos la tabla de usuarios a `UsuariosTable.tsx` con props tipadas, y los items de la guía rápida del formulario a un array iterado.

**P: ¿Por qué separaron la capa de API en lib/api/?**
> Para aplicar el principio de responsabilidad única. Un loader tiene la responsabilidad de "orquestar la carga de datos para una ruta", no de "saber cómo hablar con el backend". Si el endpoint cambia, se modifica en un solo lugar. También es más testeable: se puede probar `getPlatos()` de forma aislada.

**P: ¿Qué es `extractRubroId`?**
> El backend a veces devuelve el ID de categoría como `rubroId`, otras como `RubroId`, otras anidado en `rubro.id`. Esta inconsistencia se normaliza en `extractRubroId()`: una función que prueba todas las variantes y devuelve el valor correcto. Se aplica en `lib/api/platos.api.ts` al mapear los platos que vienen del servidor.

**P: ¿Qué es `cn()`?**
> Una función utilitaria que combina `clsx` (clases condicionales) + `tailwind-merge` (resolución de conflictos de Tailwind). Permite escribir:
> ```ts
> cn("base-class", isActive && "active-class", "override-class")
> ```
> Si dos clases de Tailwind se contradicen (ej. `bg-red-500` y `bg-blue-500`), `twMerge` mantiene la última.

**P: ¿Cómo se adapta la sidebar según el rol?**
> Cada link de la sidebar está envuelto en `RequirePermiso`. Si el usuario no tiene el permiso correspondiente, el link directamente no se renderiza. No se deshabilita, no se oculta con CSS: no existe en el DOM.

---

## 6. Posibles mejoras que pueden mencionar proactivamente

Si el tribunal pregunta qué mejorarían, estas son respuestas honestas y técnicamente válidas:

- **Manejo automático del 401**: si el token vence, interceptar en `authFetch` y redirigir a login.
- **Refresh token**: implementar renovación automática del JWT sin pedir login nuevamente.
- **Caché de datos**: React Router ya maneja algo de caché, pero se podría agregar una librería como React Query para mayor control.
- **Testing**: el proyecto no tiene tests. Se podría agregar Vitest + Testing Library para componentes y funciones de `lib/`.
- **Code splitting**: el bundle único de 500 KB podría dividirse con `import()` dinámico por ruta para mejorar la carga inicial.
- **Validación de formularios**: agregar una librería como Zod para validar los datos del form antes de enviarlos al servidor.
- **Error boundary**: agregar componentes `ErrorBoundary` para capturar errores de render inesperados.

---

## 7. Estructura de la defensa (guión sugerido)

**1. Introducción (1-2 min)**
> "El Buen Sabor es una SPA de gestión interna para un restaurante. Desarrollada con React 19, TypeScript y React Router v7. Tiene autenticación basada en JWT con control de acceso por roles y permisos, comunicación en tiempo real con Socket.io para el monitor de cocina, y una interfaz administrativa para gestionar platos y personal."

**2. Recorrido rápido por la app (2-3 min)**
> Mostrar: login → redirección según rol → sidebar adaptada → algún CRUD → monitor de cocina → logout.

**3. Explicación técnica (según lo que el tribunal pida)**
> Tener abierto el código. Los puntos más probables: autenticación, loaders/actions, Context API, TypeScript.

**4. Justificación de decisiones (si preguntan)**
> "Elegimos X porque Y. La alternativa era Z pero tenía la desventaja de W."

**5. Correcciones del profe (si preguntan)**
> Explicar las 6 mejoras implementadas y el razonamiento detrás de cada una.
