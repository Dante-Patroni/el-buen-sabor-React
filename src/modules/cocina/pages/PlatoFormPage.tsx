import { useState, useEffect } from "react";

export const PlatoFormPage = () => {
   
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
    const [descripcion, setDescripcion] = useState("");

    type Rubro = {
        id: number;
        denominacion: string;
        subrubros?: Rubro[];
    };

    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [rubroId, setRubroId] = useState<number | null>(null);

    useEffect(() => {
        fetch("http://localhost:3000/api/rubros")
            .then((res) => res.json())
            .then((data) => setRubros(data))
            .catch((err) => console.error(err));
    }, []);
  

    const opcionesRubros = rubros.flatMap((padre) =>
        (padre.subrubros || []).map((hijo) => ({
            id: hijo.id,
            label: `${padre.denominacion} / ${hijo.denominacion}`,
        }))
    );
 
    return (
        console.log("RUBROS:", rubros), // 👈 debug
        <div className="p-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">

                    {/* HEADER */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Detalles del Plato
                        </h2>
                        <p className="text-gray-500">
                            Crea o edita la información principal del plato
                        </p>
                    </div>

                    {/* FORM */}
                    <form className="space-y-6">

                        {/* NOMBRE */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Nombre del plato
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Risotto de Hongos"
                                className="w-full border rounded-lg p-3"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>

                        {/* PRECIO */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Precio
                            </label>
                            <input
                                type="number"
                                placeholder="Ej: 12000"
                                className="w-full border rounded-lg p-3"
                                value={precio}
                                onChange={(e) =>
                                    setPrecio(e.target.value === "" ? "" : Number(e.target.value))
                                }
                            />
                        </div>

                        {/* CATEGORÍA (vacío por ahora) */}
                        <select
                            className="w-full border rounded-lg p-3"
                            onChange={(e) => setRubroId(Number(e.target.value))}
                        >
                            <option value="">Seleccionar categoría</option>

                            {opcionesRubros.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.label}
                                </option>
                            ))}
                        </select>

                        {/* DESCRIPCIÓN */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Descripción
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Describe el plato..."
                                className="w-full border rounded-lg p-3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>

                        {/* IMAGEN */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Imagen
                            </label>
                            <input type="file" className="w-full" />
                        </div>

                        {/* BOTONES */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-yellow-600 text-white rounded-lg"
                            >
                                Guardar Plato
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};