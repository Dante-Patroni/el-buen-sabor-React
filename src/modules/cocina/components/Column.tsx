import { PedidoCard } from "./PedidoCard";
import type { Pedido } from "../types";

interface ColumnProps {
  title: string;
  estado: string;
  pedidos: Pedido[];
  cambiarEstado: (id: number, estado: "nuevo" | "preparacion" | "listo") => void;
  onEntregado: (id: number) => void;
}

/**
 * @description Renderiza una columna del tablero filtrando los pedidos por estado.
 * @param {ColumnProps} props - Titulo, estado objetivo, pedidos disponibles y callbacks de accion.
 * @returns {JSX.Element} Columna con tarjetas de pedidos filtradas.
 */
export const Column = ({ title, estado, pedidos, cambiarEstado, onEntregado }: ColumnProps) => {
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
          onEntregado={onEntregado}
        />
      ))}
    </div>
  );
};
