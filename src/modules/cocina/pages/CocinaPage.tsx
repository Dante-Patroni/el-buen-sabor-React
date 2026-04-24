import { Column } from "../components/Column";
import type { Pedido } from "../types";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";


export const CocinaPage = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([
        {
            id: 8821,
            mesa: 12,
            cliente: "Roberto G.",
            estado: "nuevo",
            hora: "12:24:31",
            items: [
                { nombre: "Hamburguesa Doble", cantidad: 2, aclaracion: "Sin cebolla" },
                { nombre: "Papas fritas", cantidad: 1 },
            ],
        },
        {
            id: 8819,
            mesa: 4,
            cliente: "Maria L.",
            estado: "preparacion",
            hora: "12:15:45",
            items: [
                { nombre: "Ensalada Caesar", cantidad: 1, aclaracion: "Extra aderezo" },
                { nombre: "Soda Lima", cantidad: 2 },
            ],
        },
    ]);

    const cambiarEstado = (id: number, nuevoEstado: "nuevo" | "preparacion" | "listo") => {
        const nuevosPedidos = pedidos.map((p) =>
            p.id === id ? { ...p, estado: nuevoEstado } : p
        );

        setPedidos(nuevosPedidos);//actualiza la Ui automáticamente al cambiar el estado de un pedido
    };

    const [filtro, setFiltro] = useState<
        "todos" | "nuevo" | "preparacion" | "listo"
    >("todos");

    const pedidosFiltrados =
        filtro === "todos"
            ? pedidos
            : pedidos.filter((p) => p.estado === filtro);
    return (
        <div className="min-h-screen flex flex-col">
            <header className= "border-b px-6 py-3 flex flex-col gap-2">
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
                    <Button onClick={() => setFiltro("todos")} active={filtro === "todos"}>
                        Todos
                    </Button>

                    <Button
                        variant="warning"
                        onClick={() => setFiltro("nuevo")}
                        active={filtro === "nuevo"}
                    >
                        Pendientes
                    </Button>

                    <Button
                        variant="success"
                        onClick={() => setFiltro("preparacion")}
                        active={filtro === "preparacion"}
                    >
                        En Proceso
                    </Button>

                    <Button
                        variant="dark"
                        onClick={() => setFiltro("listo")}
                        active={filtro === "listo"}
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
