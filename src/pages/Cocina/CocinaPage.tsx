import { Column } from "../../modules/cocina/components/Column";
import type { Pedido } from "../../modules/cocina/types";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { io } from "socket.io-client"; // 📡 Importante para los websockets

export const CocinaPage = () => {
    // 1. Empezamos con el estado vacío
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "nuevo" | "preparacion" | "listo">("todos");

    // ==========================================
    // 📡 FETCH INICIAL (TRAER DATOS AL CARGAR)
    // ==========================================
    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                // Reemplaza esto con tu forma de manejar el token
                const token = localStorage.getItem("token") || "";

                const response = await fetch("http://localhost:3000/api/cocina/pedidos", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // data.data porque el back devuelve { cantidad, data: [...] }
                    setPedidos(data.data);
                } else {
                    console.error("Error al traer pedidos de cocina:", response.statusText);
                }
            } catch (error) {
                console.error("Error de red:", error);
            }
        };

        fetchPedidos();
    }, []);

    // ==========================================
    // ⚡ WEBSOCKETS (ESCUCHAR CAMBIOS EN TIEMPO REAL)
    // ==========================================
    useEffect(() => {
        const socket = io("http://localhost:3000", {
            transports: ['websocket', 'polling']
        });

        // Verificamos conexión exitosa en la consola
        socket.on("connect", () => {
            console.log("🟢 ¡React conectado exitosamente al WebSocket del Backend!");
        });

        // Escuchamos pedido nuevo
        socket.on("nuevo-pedido", (nuevoPedido: Pedido) => {
            console.log("🔥 ¡NUEVO PEDIDO RECIBIDO POR WEBSOCKET!", nuevoPedido);
            const pedidoFormateado: Pedido = {
                ...nuevoPedido,
                estado: "nuevo",
                // Convertimos la fecha de la BD a texto "HH:MM:SS"
                hora: new Date(nuevoPedido.createdAt || new Date()).toLocaleTimeString("es-AR"),
                items: nuevoPedido.items.map((item: any) => ({
                    nombre: item.nombre || item.plato,
                    cantidad: item.cantidad,
                    aclaracion: item.aclaracion || ""
                }))
            };
            setPedidos((prevPedidos) => [...prevPedidos, pedidoFormateado]);
        });

        // Escuchamos si otro cocinero cambia el estado
        socket.on("estado-pedido-actualizado", ({ id, estado }) => {
            console.log(`🔄 El pedido ${id} cambió a ${estado}`);
            setPedidos((prevPedidos) =>
                prevPedidos.map((p) => p.id === id ? { ...p, estado } : p)
            );
        });

        // Limpiar al cerrar componente
        return () => {
            socket.off("connect");
            socket.off("nuevo-pedido");
            socket.off("estado-pedido-actualizado");
            socket.disconnect();
        };
    }, []);

    // ==========================================
    // LÓGICA DE UI
    // ==========================================
    // ==========================================
    // 🔄 CAMBIAR ESTADO (PARA CUANDO EL COCINERO TOCA LAS TARJETAS)
    // ==========================================
    const cambiarEstado = async (id: number, nuevoEstado: "nuevo" | "preparacion" | "listo") => {
        // 1. Actualización rápida en pantalla (para que el cocinero no tenga que esperar)
        // 1. Actualización rápida en pantalla (para que el cocinero no tenga que esperar)
        const nuevosPedidos = pedidos.map((p) =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        );
        setPedidos(nuevosPedidos);
        // 2. Le avisamos a la Base de Datos
        try {
            // Convertimos las palabras de tu React a las palabras oficiales del backend
            const estadoBackend = nuevoEstado === "preparacion" ? "en_preparacion" :
                nuevoEstado === "listo" ? "entregado" : "pendiente";

            // Sacamos el token (si lo usas, sino manda "")
            const token = localStorage.getItem("token") || "";

            // Le pegamos al nuevo endpoint PATCH
            const response = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    //"Authorization": `Bearer ${token}`  Puedes borrar esta línea si quitaste el authMiddleware
                },
                body: JSON.stringify({ estado: estadoBackend })
            });

            if (!response.ok) {
                console.error("El backend rechazó el cambio de estado.");
                // Si falla, podrías revertir la UI aquí
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
                {/* FILA SUPERIOR */}
                <div className="flex items-center justify-between h-10">
                    <h1 className="text-xl font-bold text-yellow-700">
                        MONITOR DE COCINA
                    </h1>

                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
                        CONECTADO: ESCUCHANDO PEDIDOS...
                    </span>
                </div>

                {/* FILTROS */}
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

            {/* TABLERO */}
            <main className="flex-1 p-6">
                <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <Column title="Pendientes" estado="nuevo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                    <Column title="En Proceso" estado="preparacion" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                    <Column title="Listos" estado="listo" pedidos={pedidosFiltrados} cambiarEstado={cambiarEstado} />
                </div>
            </main>
        </div>
    );
};
