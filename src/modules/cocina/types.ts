/**
 * Representa un ítem individual dentro de un pedido de cocina.
 */
export interface ItemPedido {
  /** Nombre del plato o producto */
  nombre: string;
  /** Cantidad solicitada */
  cantidad: number;
  /** Notas o aclaraciones del cliente (ej. "sin cebolla") */
  aclaracion?: string;
  /** Nombre alternativo del plato (variante del backend) */
  plato?: string;
}

/**
 * Representa un pedido completo que se muestra en el monitor de cocina.
 */
export interface Pedido {
  /** Identificador único del pedido */
  id: number;
  /** Número de mesa asociado */
  mesaId: number;
  /** Nombre del cliente que realizó el pedido */
  cliente: string;
  /** Estado actual del pedido en el flujo de cocina */
  estado: "nuevo" | "preparacion" | "listo";
  /** Hora de creación del pedido (formato legible) */
  hora: string;
  /** Lista de platos/items que componen el pedido */
  items: ItemPedido[];
  /** Fecha de creación del registro (ISO string) */
  createdAt?: string;
}
