import { Column } from "../../modules/cocina/components/Column";
import type { ItemPedido, Pedido } from "../../modules/cocina/types";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { io } from "socket.io-client";

/**
 * @description Renderiza el monitor de cocina en tiempo real con filtros y columnas por estado.
 * @returns {JSX.Element} Pagina del tablero de pedidos de cocina.
 */
export const CocinaPage = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>(() => {
        const stored = localStorage.getItem('pedidos');
        try {
            return stored ? JSON.parse(stored) as Pedido[] : [];
        } catch {
            return [];
        }
    });
    const [filtro, setFiltro] = useState<"todos" | "nuevo" | "preparacion" | "listo">("todos");
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    /**
     * @description Convierte estados del backend al estado visual usado por cocina.
     * @param {string} estadoBackend - Estado recibido desde la API o WebSocket.
     * @returns {"nuevo"|"preparacion"|"listo"|"entregado"} Estado equivalente para la UI.
     */
    const mapEstado = (estadoBackend: string): "nuevo" | "preparacion" | "listo" | "entregado" => {
        switch (estadoBackend) {
            case "pendiente":
                return "nuevo";
            case "en_preparacion":
                return "preparacion";
            case "listo":
                return "listo";
            case "entregado":
                return "entregado";
            default:
                return "nuevo";
        }
    };

    /**
     * @description Obtiene los pedidos activos desde el backend y los adapta al formato del monitor.
     * @returns {Promise<void>} No retorna valor; actualiza el estado local de pedidos y carga.
     */
    const fetchPedidos = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            const response = await fetch(`${API_URL}/api/cocina/pedidos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();



                    const fetched: Pedido[] = data.data
                        .map((p: any) => ({
                            ...p,
                            estado: mapEstado(p.estado),
                            hora: new Date(p.createdAt || new Date()).toLocaleTimeString("es-AR"),
                            items: (p.items || p.detalles || p.DetallePedidos || []).map((item: any) => ({
                                nombre: item.plato?.nombre || item.nombre || item.Plato?.nombre || "",
                                cantidad: item.cantidad,
                                aclaracion: item.aclaracion || item.observacion || "",
                            })),
                        }))
                        .filter((p: any) => p.estado !== "entregado");

                // Actualización directa para sincronizar con la DB (evita ghost orders del localStorage)
                setPedidos(fetched);
            } else {
                console.error("Error al traer pedidos de cocina:", response.statusText);
            }
        } catch (error) {
            console.error("Error de red:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 📡 Carga inicial de pedidos
    useEffect(() => {
        fetchPedidos();
    }, [API_URL]);

    // // ⚡ WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        const socket = io(`${API_URL}`, {
            transports: ["websocket", "polling"],
        });



        socket.on("connect", () => {
            console.log("🟢 WebSocket conectado");
        });

        // ✅ FIX 1: evitar duplicados
        socket.on("nuevo-pedido", (nuevoPedido: Pedido) => {
            setPedidos((prev) => {
                const existe = prev.some(p => p.id === nuevoPedido.id);
                if (existe) return prev;

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

                return [...prev, pedidoFormateado];
            });
        });

        socket.on("estado-pedido-actualizado", ({ id, estado }) => {
            const estadoMapeado = mapEstado(estado);

            setPedidos((prev) => {
                if (estadoMapeado === "entregado") {
                    return prev.filter(p => p.id !== id);
                }
                return prev.map((p) =>
                    p.id === id ? { ...p, estado: estadoMapeado as any } : p
                );
            });
        });

        // ✅ FIX 2: actualización robusta (no desaparece)
        socket.on("pedido-modificado", (pedidoActualizado: any) => {
            const estadoMapeado = mapEstado(pedidoActualizado.estado);

            const rawItems: any[] =
                pedidoActualizado.items ||
                pedidoActualizado.DetallePedidos ||
                pedidoActualizado.detallePedidos ||
                pedidoActualizado.detalles ||
                [];

            setPedidos((prev) => {
                if (estadoMapeado === "entregado") {
                    return prev.filter(p => p.id !== pedidoActualizado.id);
                }

                const existe = prev.some(p => p.id === pedidoActualizado.id);
                
                const itemsMapeados: ItemPedido[] =
                    rawItems.length > 0
                        ? rawItems.map((item: any) => ({
                            nombre: item.plato?.nombre || item.nombre || item.Plato?.nombre || "",
                            cantidad: item.cantidad,
                            aclaracion: item.aclaracion || item.observacion || "",
                        }))
                        : prev.find(p => p.id === pedidoActualizado.id)?.items || [];

                const pedidoNuevo: Pedido = {
                    ...pedidoActualizado,
                    estado: estadoMapeado as any,
                    hora: pedidoActualizado.createdAt
                        ? new Date(pedidoActualizado.createdAt).toLocaleTimeString("es-AR")
                        : new Date().toLocaleTimeString("es-AR"),
                    items: itemsMapeados,
                };

                // 👉 clave: si no existe, lo agrega
                if (!existe) return [...prev, pedidoNuevo];

                return prev.map((p) =>
                    p.id === pedidoActualizado.id ? pedidoNuevo : p
                );
            });
        });

        return () => {
            socket.off("connect");
            socket.off("nuevo-pedido");
            socket.off("estado-pedido-actualizado");
            socket.off("pedido-modificado");
            socket.disconnect();
        };
    }, [API_URL]);

    /**
     * @description Finaliza el ciclo de un pedido en el monitor marcándolo como entregado.
     * @param {number} id - Identificador del pedido.
     */
    const marcarComoEntregado = async (id: number) => {
        // Actualización optimista: remover del estado local
        setPedidos(prev => prev.filter(p => p.id !== id));

        try {
            const response = await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: "entregado" })
            });

            if (!response.ok) {
                console.error("Error al marcar como entregado en el backend.");
            }
        } catch (e) {
            console.error("Error de red al marcar entregado", e);
        }
    };

    // 💾 Persistencia en localStorage para evitar pérdida al navegar
    useEffect(() => {
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }, [pedidos]);


    /**
     * @description Cambia el estado de un pedido con actualizacion optimista y sincroniza el cambio con el backend.
     * @param {number} id - Identificador del pedido a actualizar.
     * @param {"nuevo"|"preparacion"|"listo"} nuevoEstado - Nuevo estado visual del pedido.
     * @returns {Promise<void>} No retorna valor; actualiza estado local y remoto.
     */
    const cambiarEstado = async (id: number, nuevoEstado: "nuevo" | "preparacion" | "listo") => {
        const nuevosPedidos = pedidos.map((p) =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        );
        setPedidos(nuevosPedidos);

        try {
            const estadoBackend = nuevoEstado === "preparacion" ? "en_preparacion" :
                nuevoEstado === "listo" ? "listo" : "pendiente";

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
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-yellow-700">
                            MONITOR DE COCINA
                        </h1>
                        <button
                            onClick={() => fetchPedidos()}
                            disabled={isLoading}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                            title="Refrescar pedidos"
                        >
                            <span className={`material-symbols-outlined text-gray-500 ${isLoading ? 'animate-spin' : ''}`}>
                                sync
                            </span>
                        </button>
                    </div>
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
                        <Column title="Pendientes" estado="nuevo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} onEntregado={marcarComoEntregado} />
                        <Column title="En Proceso" estado="preparacion" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} onEntregado={marcarComoEntregado} />
                        <Column title="Listos" estado="listo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} onEntregado={marcarComoEntregado} />
                    </div>
                </main>
            )}
        </div>
    );
};
