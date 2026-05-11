Idea General

Este proyecto es un frontend React para “El Buen Sabor”, enfocado en gestión de cocina y administración de platos. Usa React Router en Data Mode, por lo que parte de la carga y escritura de datos no ocurre dentro de los componentes, sino en loaders y actions definidos en el router.

La app tiene dos flujos principales:

Monitor de cocina: muestra pedidos en tiempo real.
Catálogo de platos: lista, crea y edita platos.

Entrada De La App

index.html

Es el HTML base que carga la aplicación. Tiene el div donde React monta toda la interfaz.

src/main.tsx

Es el punto de entrada de React. Renderiza el RouterProvider y le pasa el router principal.

src/app/routes.tsx

Es uno de los archivos más importantes. Define las rutas de la aplicación y también los loaders/actions.

Acá están:

platosLoader: pide al backend todos los platos y normaliza el rubroId.

platoLoader: pide un plato específico por ID para editarlo.

crearPlatoAction: recibe el formulario de nuevo plato, envía los datos al backend y luego sube imagen si existe.

editarPlatoAction: actualiza un plato existente y también permite subir imagen.

router: conecta cada URL con su componente, loader y action.

En una defensa, podrías decir:

“La app usa React Router en Data Mode. Eso permite que la carga de datos y los submits de formularios estén declarados junto con las rutas, separando mejor la lógica de navegación de la UI.”

Layout Y Navegación

src/components/layout/AppLayout.tsx

Define la estructura visual general: una sidebar fija a la izquierda y un área principal donde se renderiza la página activa mediante Outlet.

src/components/layout/Sidebar.tsx

Contiene los enlaces principales: Monitor de Cocina, Platos, Configuración y Salir. Usa Link de React Router para navegar sin recargar la página.

Páginas Principales

src/pages/Cocina/CocinaPage.tsx

Es el monitor de cocina. Muestra pedidos separados por estado: pendientes, en proceso y listos.

Hace varias cosas:

Carga pedidos iniciales desde el backend con fetch.

Guarda pedidos en localStorage para no perderlos al navegar.

Se conecta por WebSocket usando socket.io-client.

Escucha eventos como nuevo-pedido, estado-pedido-actualizado y pedido-modificado.

Permite cambiar el estado de un pedido de forma optimista: primero cambia la UI y después avisa al backend.

Flujo resumido:

Backend HTTP trae pedidos iniciales → React guarda en estado → se muestran en columnas → WebSocket actualiza en vivo → usuario cambia estado → frontend actualiza UI → frontend envía PATCH al backend.

src/pages/Cocina/PlatosPage.tsx

Muestra el catálogo de platos en tabla.

Recibe los platos desde useLoaderData, o sea desde platosLoader definido en routes.tsx.

Además carga rubros desde /api/rubros para armar filtros.

Permite filtrar por categoría y por estado activo/inactivo.

Al hacer click en un plato, navega al formulario de edición.

Flujo:

platosLoader trae platos → PlatosPage los recibe → carga rubros para filtros → usuario filtra o selecciona un plato → navega a /cocina/platos/:id.

src/pages/Cocina/PlatoFormPage.tsx

Sirve tanto para crear como para editar platos.

Si está en modo edición, recibe un plato desde platoLoader.

Usa <Form> de React Router, no un <form> común. Eso hace que el submit vaya a la action correspondiente: crear o editar.

Maneja estado local para nombre, precio, descripción, rubro, stock, imagen, si es menú del día y si está activo.

Tiene preview de imagen y un calendario visual.

Flujo crear:

Usuario completa formulario → React Router ejecuta crearPlatoAction → se manda POST al backend → si hay imagen, se sube aparte → redirige a catálogo.

Flujo editar:

platoLoader carga datos → formulario se completa con esos datos → usuario modifica → React Router ejecuta editarPlatoAction → se manda PUT → si hay imagen nueva, se sube → redirige.

src/pages/Configuracion/ConfigPage.tsx

Permite activar o desactivar modo oscuro. Guarda la preferencia en localStorage y agrega o quita la clase dark al documento.

src/pages/Errores/ErrorPage.tsx

Página de error para rutas con problemas. Si React Router detecta error de ruta, lo muestra de manera controlada.

src/pages/Errores/Proximamente.tsx

Pantalla temporal para funcionalidades todavía no implementadas, como login.

Componentes Del Módulo Cocina

src/modules/cocina/components/Column.tsx

Representa una columna del monitor. Recibe todos los pedidos y filtra por estado. Luego renderiza una PedidoCard por cada pedido correspondiente.

src/modules/cocina/components/PedidoCard.tsx

Muestra la información de un pedido: mesa, cliente, items, aclaraciones, hora y estado. También muestra un botón para avanzar el pedido de “nuevo” a “preparación” o de “preparación” a “listo”.

src/modules/cocina/components/SidebarItems.tsx

Componente visual de item de sidebar. Actualmente no parece ser usado por la sidebar principal, pero está preparado para reutilizar navegación con ícono, texto y estado activo.

src/modules/cocina/types.ts

Define tipos específicos del módulo cocina:

ItemPedido: item individual dentro de un pedido.

Pedido: pedido completo mostrado en cocina.

Componentes UI Reutilizables

src/components/ui/Button.tsx

Botón reutilizable basado en Base UI y variantes con class-variance-authority. Permite estilos como default, outline, secondary, ghost, destructive, etc.

src/components/ui/input.tsx

Input reutilizable con estilos consistentes.

src/components/ui/label.tsx

Label reutilizable para formularios.

src/components/ui/card.tsx

Sistema de tarjetas: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, etc.

src/components/ui/calendar.tsx

Calendario basado en react-day-picker, estilizado para integrarse con el sistema visual.

Tipos Y Utilidades

src/types/index.ts

Define tipos globales del dominio:

Rubro: categoría o subcategoría de platos.

Plato: entidad principal del catálogo.

src/lib/utils.ts

Tiene helpers generales.

cn: combina clases CSS y resuelve conflictos de Tailwind.

extractRubroId: normaliza diferentes formas en que el backend puede devolver el rubro: rubroId, RubroId, rubro_id, rubro.id o Rubro.id.

Este helper es importante porque hace al frontend más tolerante ante variaciones del backend.

Flujo De Información Principal

Flujo de platos:

Usuario entra a /cocina/platos.
React Router ejecuta platosLoader.
platosLoader pide datos al backend.
Normaliza cada plato con extractRubroId.
PlatosPage recibe los datos con useLoaderData.
La página carga rubros para filtros.
Usuario puede filtrar o seleccionar un plato.
Si selecciona uno, navega a /cocina/platos/:id.
React Router ejecuta platoLoader.
PlatoFormPage recibe el plato y llena el formulario.
Al guardar, React Router ejecuta editarPlatoAction.
La action manda PUT al backend y redirige al catálogo.

Flujo de creación:

Usuario entra a /cocina/platos/nuevo.
Se muestra PlatoFormPage vacío.
Usuario completa datos.
Submit del <Form> ejecuta crearPlatoAction.
Se manda POST al backend.
Si hay imagen, se sube con otro POST.
Redirige a /cocina/platos.

Flujo de cocina:

Usuario entra a /cocina.
CocinaPage carga pedidos iniciales por HTTP.
Los pedidos se guardan en estado React.
También se persisten en localStorage.
Se abre conexión WebSocket.
Si entra un pedido nuevo, el socket actualiza la pantalla.
Si cambia un pedido, el socket sincroniza la UI.
Si el cocinero cambia el estado, la UI se actualiza primero y después se manda PATCH al backend.

Frase Para Defender

Podrías explicarlo así:

“Este frontend está organizado por responsabilidades. El router define las rutas y centraliza la carga y escritura de datos mediante loaders y actions. Las páginas se encargan de mostrar la información y manejar estado local de UI. Los componentes reutilizables encapsulan piezas visuales como botones, cards, columnas y tarjetas de pedido. El flujo de cocina combina carga inicial por HTTP con actualizaciones en tiempo real mediante WebSocket, mientras que el flujo de platos usa React Router Data Mode para cargar, crear y editar registros de forma ordenada.”