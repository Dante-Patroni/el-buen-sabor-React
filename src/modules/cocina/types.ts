export interface ItemPedido {
  nombre: string;
  cantidad: number;
  aclaracion?: string;
}

export interface Pedido {
  id: number;
  mesa: number;
  cliente: string;
  estado: "nuevo" | "preparacion" | "listo";
  hora: string;
  items: ItemPedido[];
}