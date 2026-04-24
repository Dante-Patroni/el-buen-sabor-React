import type { Pedido } from "../types";
import { Button } from "../../../components/ui/Button";
interface Props {
  pedido: Pedido;
  onCambiarEstado: (id: number, estado: Pedido["estado"]) => void;
}

export const PedidoCard = ({ pedido, onCambiarEstado }: Props) => {
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
      boton: "warning",
      textoBoton: "Empezar",
    },
    preparacion: {
      border: "border-green-600",
      badge: "bg-green-600",
      boton: "success",
      textoBoton: "Listo para entregar",
    },
    listo: {
      border: "border-gray-900",
      badge: "bg-cyan-500",
      boton: "dark",
      textoBoton: "Archivar",
    },
  } as const;

  const estadoUI = configEstado[pedido.estado];

  return (
    <div className="bg-white border-l-4 border-orange-500 rounded shadow">

      {/* HEADER */}
      <div className="bg-gray-800 text-white p-3 flex justify-between">
        <span className="font-bold">Mesa {pedido.mesa}</span>

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
        <Button
          onClick={() => onCambiarEstado(pedido.id, siguienteEstado)}
          variant={estadoUI.boton}
        >
          {estadoUI.textoBoton}
        </Button>

        {/* HORA */}
        <p className="text-xs text-gray-400">
          {pedido.hora}
        </p>
      </div>
    </div>
  );
};