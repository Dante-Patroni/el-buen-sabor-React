# 07 - Convenciones de Codigo

Ultima actualizacion: 2026-06-18

## Estilo general
- Codigo claro y simple.
- Nombres descriptivos.
- Sin duplicacion innecesaria.
- Sin logica de negocio en los componentes: va en loaders, actions o en `lib/`.

## Componentes UI

- Usar siempre los componentes del sistema (`Button`, `Input`, `Select`) en lugar de los tags HTML crudos con estilos inline.
- La gracia de los componentes es normalizar comportamientos, reducir codigo y mantener consistencia visual.
- Si un tag HTML se usa con estilos en mas de un lugar, crear un wrapper en `src/components/ui/`.

## Mappings y constantes

- Los objetos de mapeo (estilos por rol, opciones fijas, listas hardcodeadas) van en `src/lib/mappings.ts`.
- Las funciones de transformacion reutilizables (como aplanar un arbol de categorias) van en `src/lib/utils.ts`.
- No definir estas estructuras inline dentro de los componentes.

## Types e Interfaces

- Centralizar en `src/types/`, divididos por entidad:
  - `plato.types.ts` → Plato, Rubro
  - `usuario.types.ts` → Usuario, Rol
  - `pedido.types.ts` → Pedido, ItemPedido
- `src/types/index.ts` es un barrel que re-exporta todo.
- Usar `import type` cuando solo se necesite la definicion.
- No definir tipos inline dentro de los componentes ni duplicarlos entre archivos.

## Capa de API

- Las llamadas HTTP van en `src/lib/api/`, agrupadas por entidad:
  - `platos.api.ts` → funciones para el recurso platos
  - `usuarios.api.ts` → funciones para el recurso usuarios
- Desde estas funciones se invoca `authFetch`.
- Los loaders y actions de `routes.tsx` llaman a estas funciones, no a `authFetch` directamente.
- Los endpoints no se pasan como parametros en los componentes; viven encapsulados en `lib/api/`.

## Componentizacion

- Cuando una seccion de JSX se repite o supera ~50 lineas dentro de una pagina, extraerla a un componente.
- Los componentes especificos de una seccion van en `src/components/<Seccion>/` (ej. `components/Administracion/UsuariosTable.tsx`).
- Parametrizar con props en lugar de duplicar logica.

## JSDoc obligatorio
Cada funcion exportada debe tener JSDoc encima.

Plantilla:
```js
/**
 * @description Que hace la funcion.
 * @param {Tipo} parametro - Descripcion.
 * @returns {Tipo|Promise<Tipo>} Retorno.
 * @throws {Error} Errores posibles.
 */
```

## Errores
- En funciones de `lib/api/`: `throw new Error("Mensaje descriptivo")`
- En actions de `routes.tsx`: retornar `{ error: string }` para que el componente lo muestre via `useActionData()`.

## Respuestas HTTP
- Verificar siempre `res.ok` antes de procesar la respuesta.
- Mantener consistencia en los codigos HTTP y la estructura de los datos.
