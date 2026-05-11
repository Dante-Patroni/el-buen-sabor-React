import type { Pedido } from "../types";
import { Button } from "../../../components/ui/Button";

interface Props {
  pedido: Pedido;
  onCambiarEstado: (id: number, estado: Pedido["estado"]) => void;
  onEntregado: (id: number) => void;
}

/**
 * @description Renderiza una tarjeta de pedido con detalle de items y accion para avanzar su estado.
 * @param {Props} props - Pedido a mostrar y callbacks para interactuar con su estado.
 * @returns {JSX.Element} Tarjeta del pedido para el monitor de cocina.
 */
export const PedidoCard = ({ pedido, onCambiarEstado, onEntregado }: Props) => {
  const siguienteEstado =
    pedido.estado === "nuevo"
      ? "preparacion"
      : pedido.estado === "preparacion"
        ? "listo"
        : "listo";

  const configEstado = {
    nuevo: {
      border: "border-orange-500",
      badge: "bg-red-500",
      claseBoton: "bg-amber-500 hover:bg-amber-600 text-white w-full",
      textoBoton: "Empezar",
    },
    preparacion: {
      border: "border-emerald-500",
      badge: "bg-emerald-600",
      claseBoton: "bg-emerald-500 hover:bg-emerald-600 text-white w-full",
      textoBoton: "Listo para entregar",
    },
    listo: {
      border: "border-slate-800",
      badge: "bg-cyan-500",
      claseBoton: "bg-blue-700 hover:bg-blue-800 text-white w-full",
      textoBoton: "Entregado",
    },
  } as const;

  const estadoUI = configEstado[pedido.estado];

  return (
    <div className={`bg-white border-l-4 rounded shadow ${estadoUI.border}`}>

      {/* HEADER */}
      <div className="bg-gray-800 text-white p-3 flex justify-between">
        <span className="font-bold">Mesa {pedido.mesaId}</span>

        <span className={`text-xs px-2 py-1 rounded ${estadoUI.badge}`}>
          {pedido.estado.toUpperCase()}
        </span>
      </div>

      {/* BODY */}
      <div className="p-3 space-y-2">
        <h4 className="font-semibold">Pedido #{pedido.id}</h4>
        <p className="text-sm text-gray-600">
          Cliente: {pedido.cliente}
        </p>

        <hr />

        <p className="text-sm font-medium">Detalle de comanda</p>

        {pedido.items.map((item, i) => (
          <div key={i} className="text-sm">
            <div className="flex justify-between">
              <span>{item.nombre}</span>
              <span className="bg-gray-300 px-2 rounded">
                x{item.cantidad}
              </span>
            </div>

            {item.aclaracion && (
              <p className="text-xs text-gray-500">
                {item.aclaracion}
              </p>
            )}
          </div>
        ))}

        {/* BOTÓN */}
        <div className="pt-2">
          {pedido.estado === "listo" ? (
            <Button
              onClick={() => onEntregado(pedido.id)}
              variant="default"
              className={estadoUI.claseBoton}
            >
              {estadoUI.textoBoton}
            </Button>
          ) : (
            <Button
              onClick={() => onCambiarEstado(pedido.id, siguienteEstado)}
              variant="default"
              className={estadoUI.claseBoton}
            >
              {estadoUI.textoBoton}
            </Button>
          )}
        </div>

        {/* HORA */}
        <p className="text-xs text-gray-400">
          {pedido.hora}
        </p>
      </div>
    </div>
  );
};
