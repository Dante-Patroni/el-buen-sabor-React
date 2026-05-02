import { Column } from "../../modules/cocina/components/Column";
import type { ItemPedido, Pedido } from "../../modules/cocina/types";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { io } from "socket.io-client";

/**
 * Monitor de cocina en tiempo real.
 * 
 * Muestra los pedidos activos en columnas por estado (nuevo, preparación, listo).
 * Se conecta al backend vía HTTP para carga inicial y WebSocket para actualizaciones en vivo.
 * 
 * Funcionalidades:
 * - Fetch inicial de pedidos activos
 * - Escucha de nuevos pedidos y cambios de estado vía WebSocket
 * - Cambio de estado optimista (UI primero, luego backend)
 * - Filtros por estado
 */
export const CocinaPage = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "nuevo" | "preparacion" | "listo">("todos");
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    // 📡 Carga inicial de pedidos
    useEffect(() => {
        const fetchPedidos = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token") || "";
                const response = await fetch(`${API_URL}/api/cocina/pedidos`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPedidos(data.data);
                } else {
                    console.error("Error al traer pedidos de cocina:", response.statusText);
                }
            } catch (error) {
                console.error("Error de red:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPedidos();
    }, []);

    // ⚡ WebSocket para actualizaciones en tiempo real
    useEffect(() => {
    const socket = io(`${API_URL}`, {
        transports: ["websocket", "polling"],
    });

    const mapEstado = (estadoBackend: string): "nuevo" | "preparacion" | "listo" => {
        switch (estadoBackend) {
            case "pendiente":
                return "nuevo";
            case "en_preparacion":
                return "preparacion";
            case "entregado":
                return "listo";
            default:
                return "nuevo";
        }
    };

    socket.on("connect", () => {
        console.log("🟢 WebSocket conectado");
    });

    socket.on("nuevo-pedido", (nuevoPedido: Pedido) => {
        const pedidoFormateado: Pedido = {
            ...nuevoPedido,
            estado: "nuevo",
            hora: new Date(nuevoPedido.createdAt || new Date()).toLocaleTimeString("es-AR"),
            items: nuevoPedido.items.map((item: ItemPedido) => ({
                nombre: item.nombre || item.plato || "",
                cantidad: item.cantidad,
                aclaracion: item.aclaracion || "",
            })),
        };

        setPedidos((prev) => [...prev, pedidoFormateado]);
    });

    socket.on("estado-pedido-actualizado", ({ id, estado }) => {
        const estadoMapeado = mapEstado(estado);

        setPedidos((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, estado: estadoMapeado } : p
            )
        );
    });

    socket.on("pedido-modificado", (pedidoActualizado: any) => {
        console.log("🟡 Pedido modificado recibido", pedidoActualizado);
        console.log("🔑 Keys del pedido:", Object.keys(pedidoActualizado));

        const estadoMapeado = mapEstado(pedidoActualizado.estado);

        // Buscar el array de items en las propiedades posibles del backend
        const rawItems: any[] =
            pedidoActualizado.items ||
            pedidoActualizado.DetallePedidos ||
            pedidoActualizado.detallePedidos ||
            pedidoActualizado.detalles ||
            pedidoActualizado.Detalles ||
            pedidoActualizado.PedidoDetalles ||
            [];

        console.log("📦 Items encontrados:", rawItems);

        setPedidos((prev) =>
            prev.map((p) => {
                if (p.id !== pedidoActualizado.id) return p;

                // Si hay items del backend, mapearlos usando el nombre existente
                // ya que el backend no envía "nombre" sino solo cantidad/precio
                let itemsMapeados: ItemPedido[];

                if (rawItems.length > 0) {
                    itemsMapeados = rawItems.map((item: any, index: number) => ({
                        nombre: item.nombre || item.plato || item.Plato?.nombre || p.items[index]?.nombre || "",
                        cantidad: item.cantidad,
                        aclaracion: item.aclaracion || item.observacion || p.items[index]?.aclaracion || "",
                    }));
                } else {
                    itemsMapeados = p.items;
                }

                return {
                    ...p,
                    mesa: pedidoActualizado.mesa ?? p.mesa,
                    cliente: pedidoActualizado.cliente ?? p.cliente,
                    estado: estadoMapeado,
                    hora: pedidoActualizado.createdAt
                        ? new Date(pedidoActualizado.createdAt).toLocaleTimeString("es-AR")
                        : p.hora,
                    items: itemsMapeados,
                };
            })
        );
    });

    return () => {
        socket.off("connect");
        socket.off("nuevo-pedido");
        socket.off("estado-pedido-actualizado");
        socket.off("pedido-modificado");
        socket.disconnect();
    };
}, []);


    /**
     * Cambia el estado de un pedido con actualización optimista.
     * Primero actualiza la UI, luego notifica al backend.
     */
    const cambiarEstado = async (id: number, nuevoEstado: "nuevo" | "preparacion" | "listo") => {
        const nuevosPedidos = pedidos.map((p) =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        );
        setPedidos(nuevosPedidos);

        try {
            const estadoBackend = nuevoEstado === "preparacion" ? "en_preparacion" :
                nuevoEstado === "listo" ? "entregado" : "pendiente";

            const response = await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: estadoBackend })
            });

            if (!response.ok) {
                console.error("El backend rechazó el cambio de estado.");
            }
        } catch (e) {
            console.error("Error de red al actualizar estado", e);
        }
    };

    const pedidosFiltrados =
        filtro === "todos"
            ? pedidos
            : pedidos.filter((p) => p.estado === filtro);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b px-6 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between h-10">
                    <h1 className="text-xl font-bold text-yellow-700">
                        MONITOR DE COCINA
                    </h1>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                        CONECTADO: ESCUCHANDO PEDIDOS...
                    </span>
                </div>

                {/* Filtros por estado */}
                <div className="flex gap-2">
                    <Button
                        variant={filtro === "todos" ? "default" : "outline"}
                        onClick={() => setFiltro("todos")}
                    >
                        Todos
                    </Button>

                    <Button
                        variant={filtro === "nuevo" ? "default" : "outline"}
                        className={filtro === "nuevo"
                            ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                            : "text-amber-600 border-amber-200 hover:bg-amber-50"
                        }
                        onClick={() => setFiltro("nuevo")}
                    >
                        Pendientes
                    </Button>

                    <Button
                        variant={filtro === "preparacion" ? "default" : "outline"}
                        className={filtro === "preparacion"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        }
                        onClick={() => setFiltro("preparacion")}
                    >
                        En Proceso
                    </Button>

                    <Button
                        variant={filtro === "listo" ? "default" : "outline"}
                        onClick={() => setFiltro("listo")}
                    >
                        Listos
                    </Button>
                </div>
            </header>

            {/* Tablero con columnas o indicador de carga */}
            {isLoading ? (
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-500">
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        <span className="text-lg">Cargando pedidos...</span>
                    </div>
                </main>
            ) : (
                <main className="flex-1 p-6">
                    <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <Column title="Pendientes" estado="nuevo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                        <Column title="En Proceso" estado="preparacion" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                        <Column title="Listos" estado="listo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                    </div>
                </main>
            )}
        </div>
    );
};
