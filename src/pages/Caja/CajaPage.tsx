import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "../../components/ui/Button";
import { authFetch } from "@/lib/authFetch";
import { ReceiptText } from "lucide-react";

type MesaResumen = {
  id: number;
  nombre?: string;
  numero?: string;
  estado?: string;
  mozo?: { nombre?: string };
};

type PedidoDetalle = {
  id: number;
  cantidad: number;
  subtotal?: number;
  aclaracion?: string;
  plato?: { nombre?: string };
  nombre?: string;
};

type Pedido = {
  id: number;
  mesaId: number;
  estado: string;
  createdAt: string;
  detalles: PedidoDetalle[];
};

type MesaDetalle = MesaResumen & {
  totalActual: number;
  pedidos: Pedido[];
};

type TicketPedidoItem = {
  platoId: number | null;
  plato: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

type TicketPedido = {
  pedidoId: number;
  cliente: string;
  items: TicketPedidoItem[];
  totalPedido: number;
};

type TicketCierre = {
  mesaId: number;
  fechaCierre: string;
  pedidos: TicketPedido[];
  subtotal: number;
  impuestos: {
    ivaPorcentaje: number;
    ivaImporte: number;
  };
  recargo: number;
  descuento: number;
  totalFinal: number;
};

export const CajaPage = () => {
  const [mesas, setMesas] = useState<MesaResumen[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<MesaDetalle | null>(null);
  const [ticket, setTicket] = useState<TicketCierre | null>(null);
  const [isClosedByMozo, setIsClosedByMozo] = useState(false);
  const [isLoadingMesas, setIsLoadingMesas] = useState(false);
  const [isLoadingMesa, setIsLoadingMesa] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchMesas = async () => {
    setError(null);
    setIsLoadingMesas(true);

    try {
      const response = await authFetch("/api/caja/mesas");

      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de mesas");
      }

      const data = await response.json();
      setMesas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al cargar las mesas"
      );
    } finally {
      setIsLoadingMesas(false);
    }
  };

  const selectMesa = async (id: number) => {
    setError(null);
    setMessage(null);
    setIsLoadingMesa(true);

    try {
      const response = await authFetch(`/api/caja/mesas/${id}`);

      if (!response.ok) {
        throw new Error("No se pudo cargar la mesa seleccionada");
      }

      const data = await response.json();
      setSelectedMesa(data);
      setTicket(null);
      setIsClosedByMozo(false);
    } catch (err) {
      setSelectedMesa(null);
      setIsClosedByMozo(false);
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al cargar la mesa"
      );
    } finally {
      setIsLoadingMesa(false);
    }
  };

  const loadTicket = async () => {
    if (!selectedMesa) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const response = await authFetch(
        `/api/caja/mesas/${selectedMesa.id}/ticket`
      );

      if (!response.ok) {
        throw new Error("No se pudo generar el ticket de cierre");
      }

      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al generar el ticket"
      );
    }
  };

  const cobrarMesa = async () => {
    if (!selectedMesa) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsProcessing(true);

    try {
      const response = await authFetch(
        `/api/caja/mesas/${selectedMesa.id}/cobrar`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo cobrar la mesa");
      }

      await response.json();
      setMessage("Mesa cobrada con éxito");
      setSelectedMesa(null);
      setTicket(null);
      await fetchMesas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al cobrar la mesa"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Socket de caja conectado");
    });

    socket.on("ticket-generado", (ticketData: any) => {
      if (selectedMesa?.id === ticketData.mesaId) {
        setTicket(ticketData);
        setMessage("Ticket generado desde el cierre de mesa por mozo");
        setIsClosedByMozo(true);
      }

      fetchMesas();
    });

    socket.on("mesa-esperando-cobro", () => {
  fetchMesas();
});

    socket.on("connect_error", (err: any) => {
      console.error("Error de socket en caja:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("ticket-generado");
      socket.off("connect_error");
      socket.off("mesa-esperando-cobro");
      socket.disconnect();
    };
  }, [selectedMesa]);

  const deliveredPedidos = selectedMesa?.pedidos?.filter(p => p.estado === "entregado") || [];
  const deliveredItems = deliveredPedidos.flatMap(p => p.detalles || []);
  const totalActualCalculado = deliveredItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Caja</h1>
          <p className="text-sm text-stone-600">
            Seleccioná una mesa para consultar el ticket y cerrar el cobro.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Mesas abiertas</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMesas}
            >
              Actualizar
            </Button>
          </div>

          {isLoadingMesas ? (
            <div className="text-stone-500">Cargando mesas...</div>
          ) : mesas.length === 0 ? (
            <div className="text-stone-500">No hay mesas abiertas en este momento.</div>
          ) : (
            <div className="space-y-3">
              {mesas.map((mesa) => (
                <button
                  key={mesa.id}
                  type="button"
                  onClick={() => selectMesa(mesa.id)}
                  className={
                    "w-full rounded-2xl border px-4 py-4 text-left transition " +
                    (selectedMesa?.id === mesa.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200 bg-white hover:border-orange-300")
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-stone-900">
                      {mesa.nombre || `Mesa ${mesa.numero ?? mesa.id}`}
                    </strong>
                    <span className="text-xs text-stone-500 uppercase">
                      {mesa.estado || "abierta"}
                    </span>
                  </div>
                  {mesa.mozo?.nombre && (
                    <p className="mt-2 text-sm text-stone-600">
                      Mozo: {mesa.mozo.nombre}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {selectedMesa ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Mesa</p>
                    <h2 className="text-2xl font-semibold text-stone-900">
                      {selectedMesa.nombre || `Mesa ${selectedMesa.numero ?? selectedMesa.id}`}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-500">Total actual</p>
                    <p className="text-3xl font-semibold text-orange-700">
                      ${totalActualCalculado.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-3xl border border-stone-200 bg-white p-5">
                <h3 className="mb-4 text-lg font-semibold text-stone-900">Pedidos</h3>

                {isLoadingMesa ? (
                  <p className="text-stone-500">Cargando detalle...</p>
                ) : deliveredItems.length === 0 ? (
                  <p className="text-stone-500">La mesa no tiene pedidos entregados.</p>
                ) : (
                  <div className="space-y-3">
                    {deliveredItems.map((detalle, idx) => (
                      <div
                        key={`${detalle.id}-${idx}`}
                        className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <strong className="text-stone-900">
                            {detalle.plato?.nombre || detalle.nombre || "Item"}
                          </strong>
                          <span className="text-sm text-stone-500">
                            x{detalle.cantidad}
                          </span>
                        </div>
                        {detalle.aclaracion && (
                          <p className="mt-2 text-sm text-stone-600">
                            {detalle.aclaracion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid gap-4 md:grid-cols-[1fr_180px]">
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className="text-lg font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <ReceiptText className="w-5 h-5 text-orange-600" />
                      Ticket de Cierre
                    </h3>
                    {ticket && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                        Mesa {ticket.mesaId}
                      </span>
                    )}
                  </div>

                  {ticket ? (
                    <div className="space-y-4">
                      {/* Ticket Header Metadata */}
                      <div className="text-xs text-stone-500 flex justify-between border-b border-stone-200 pb-2">
                        <span>Emisión: {new Date(ticket.fechaCierre).toLocaleString("es-AR")}</span>
                        <span className="font-mono">#TKT-{ticket.mesaId}-{new Date(ticket.fechaCierre).getTime().toString().slice(-4)}</span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {ticket.pedidos?.flatMap((p) => p.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-stone-700 py-1">
                            <div className="flex flex-col">
                              <span className="font-medium text-stone-900">{item.plato}</span>
                              <span className="text-xs text-stone-500">
                                {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                              </span>
                            </div>
                            <strong className="text-stone-900 self-center">
                              ${item.subtotal.toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {/* Price breakdown */}
                      <div className="border-t border-dashed border-stone-300 pt-3 space-y-2 text-sm text-stone-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <strong className="text-stone-800">${ticket.subtotal.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA ({ticket.impuestos?.ivaPorcentaje || 21}%)</span>
                          <strong className="text-stone-800">${(ticket.impuestos?.ivaImporte || 0).toFixed(2)}</strong>
                        </div>
                        {ticket.recargo > 0 && (
                          <div className="flex justify-between text-amber-700">
                            <span>Recargo</span>
                            <strong>+${ticket.recargo.toFixed(2)}</strong>
                          </div>
                        )}
                        {ticket.descuento > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Descuento</span>
                            <strong>-${ticket.descuento.toFixed(2)}</strong>
                          </div>
                        )}
                      </div>

                      {/* Final Total */}
                      <div className="border-t-2 border-stone-900 pt-3 flex justify-between items-baseline">
                        <span className="text-base font-bold text-stone-900 uppercase">Total a Pagar</span>
                        <strong className="text-2xl font-extrabold text-stone-950">
                          ${ticket.totalFinal.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-stone-400">
                      <ReceiptText className="w-10 h-10 mb-2 text-stone-300 stroke-[1.5]" />
                      <p className="text-sm">Generá el ticket antes de cobrar la mesa.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[140px] justify-end">
                  <Button
                    variant="secondary"
                    className="w-full rounded-2xl py-3 cursor-pointer"
                    disabled={isLoadingMesa || !selectedMesa}
                    onClick={loadTicket}
                  >
                    Ver ticket
                  </Button>
                  <Button
                    className="w-full rounded-2xl py-3 cursor-pointer"
                    disabled={isProcessing || !selectedMesa || isClosedByMozo}
                    onClick={cobrarMesa}
                  >
                    Cobrar mesa
                  </Button>
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500">
              <p className="text-lg font-medium">Seleccioná una mesa para ver su detalle.</p>
              <p className="mt-2 text-sm">
                El módulo de caja permite generar ticket de cierre y cobrar la mesa.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
