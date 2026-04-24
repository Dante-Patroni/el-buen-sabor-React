import { PedidoCard } from "./PedidoCard";
import type { Pedido } from "../types";

interface ColumnProps {
  title: string;
  estado: string;
  pedidos: Pedido[];
  cambiarEstado: (id: number, estado: "nuevo" | "preparacion" | "listo") => void;
}

export const Column = ({ title, estado, pedidos, cambiarEstado }: ColumnProps) => {
  const pedidosFiltrados = pedidos.filter(
    (p) => p.estado === estado
  );


  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="font-semibold">{title}</h3>

      {pedidosFiltrados.map((pedido) => (
        <PedidoCard
          key={pedido.id}
          pedido={pedido}
          onCambiarEstado={cambiarEstado}
        />
      ))}
    </div>
  );
};