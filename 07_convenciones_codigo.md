# 07 - Convenciones de Codigo

Ultima actualizacion: 2026-02-27

## Estilo general
- Codigo claro y simple.
- Nombres descriptivos.
- Sin duplicacion innecesaria.
- Sin logica de negocio en controllers.

## JSDoc obligatorio
Cada funcion debe tener JSDoc encima.

Plantilla:
```js
/**
 * @description Que hace la funcion.
 * @param {Tipo} parametro - Descripcion.
 * @returns {Tipo|Promise<Tipo>} Retorno.
 * @throws {Error} Errores de dominio posibles.
 */
```

## Errores
- En services: `throw new Error("CODIGO_DOMINIO")`
- En controllers/middlewares: mapear con `manejarErrorHttp`.

## Transacciones
- Usar en operaciones de multiples escrituras.
- Propagar `transaction` de forma explicita.

## Respuestas
- Mantener consistencia de campos y codigos HTTP.

