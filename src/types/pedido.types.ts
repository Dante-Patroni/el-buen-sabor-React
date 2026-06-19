export interface ItemPedido {
  nombre: string;
  cantidad: number;
  aclaracion?: string;
  plato?: string;
}

export interface Pedido {
  id: number;
  mesaId: number;
  cliente: string;
  estado: "nuevo" | "preparacion" | "listo";
  hora: string;
  items: ItemPedido[];
  createdAt?: string;
}
