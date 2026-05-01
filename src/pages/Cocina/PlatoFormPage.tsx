import { useState, useEffect, } from "react";
import { Form } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useLoaderData } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar"



export const PlatoFormPage = () => {
    const extractRubroId = (item: any) =>
        item?.rubroId ??
        item?.RubroId ??
        item?.rubro_id ??
        item?.rubro?.id ??
        item?.Rubro?.id ??
        null;

    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
    const [descripcion, setDescripcion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    type Rubro = {
        id: number;
        denominacion: string;
        subrubros?: Rubro[];
    };

    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [rubroId, setRubroId] = useState<number | null>(null);
    const [stockActual, setStockActual] = useState<number | "">("");
    const [esIlimitado, setEsIlimitado] = useState(false);
    const [esMenuDelDia, setEsMenuDelDia] = useState(false);
    const [esActivo, setEsActivo] = useState(true);
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [fechaDisponible, setFechaDisponible] = useState<Date | undefined>(undefined);
    const plato = useLoaderData() as any | null;
    const location = useLocation();
    const navState = (location.state as { rubroId?: number; rubroDenominacion?: string } | null);
    const rubroIdFromList = navState?.rubroId;
    const rubroDenominacionFromList = navState?.rubroDenominacion;
    const isEditMode = Boolean(plato?.id);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);

    const getAuthToken = () => {
        if (typeof window === "undefined") return null;
        const possibleKeys = ["token", "accessToken", "jwt", "authToken"];
        for (const key of possibleKeys) {
            const value = localStorage.getItem(key);
            if (value) return value;
        }
        return null;
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagenFile(file); // 👈 guardamos archivo real

        const url = URL.createObjectURL(file);
        setImagenPreview(url);
    };

    const handleIlimitadoChange = (checked: boolean) => {
        setEsIlimitado(checked);

        if (checked) {
            setStockActual(""); // limpiamos el stock
        }
    };

    useEffect(() => {
        fetch("http://localhost:3000/api/rubros")
            .then((res) => res.json())
            .then((data) => setRubros(data))
            .catch((err) => console.error(err));
    }, []);


    const opcionesRubros = rubros.flatMap((padre) => {
        const opciones = [{ id: padre.id, label: padre.denominacion }];
        const subrubros = (padre.subrubros || []).map((hijo) => ({
            id: hijo.id,
            label: `${padre.denominacion} / ${hijo.denominacion}`,
        }));
        return [...opciones, ...subrubros];
    });

    const resolveRubroIdByDenominacion = (denominacion?: string | null) => {
        const normalized = (denominacion ?? "").trim().toLowerCase();
        if (!normalized) return null;

        for (const padre of rubros) {
            for (const hijo of padre.subrubros || []) {
                if ((hijo.denominacion ?? "").trim().toLowerCase() === normalized) {
                    return hijo.id;
                }
            }
        }
        return null;
    };

    useEffect(() => {
        if (plato) {
            setNombre(plato.nombre);
            setPrecio(Number(plato.precio));
            setDescripcion(plato.descripcion);
            setEsMenuDelDia(plato.esMenuDelDia);
            setEsIlimitado(plato.esIlimitado);
            setStockActual(plato.stockActual ?? "");
            if (plato.imagenPath) {
                setImagenPreview(`http://localhost:3000${plato.imagenPath}`);
            }

            if (plato) {
                setEsActivo(plato.esActivo);
            }
            const rubroIdFromPlato = extractRubroId(plato);
            const rubroDenominacionFromPlato = plato?.rubro?.denominacion ?? plato?.Rubro?.denominacion;
            setRubroId(
                rubroIdFromPlato ??
                rubroIdFromList ??
                resolveRubroIdByDenominacion(rubroDenominacionFromPlato) ??
                resolveRubroIdByDenominacion(rubroDenominacionFromList) ??
                null
            );
        }
    }, [plato, rubroIdFromList, rubroDenominacionFromList, rubros]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (rubroId === null) {
            alert("Seleccioná una categoría");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1️⃣ Guardar plato
            const payload = {
                nombre,
                precio,
                descripcion,
                rubroId,
                esMenuDelDia,
                esIlimitado,
                esActivo,
                stockActual: esIlimitado ? 0 : stockActual,
            };

            const endpoint = isEditMode
                ? `http://localhost:3000/api/platos/${plato.id}`
                : "http://localhost:3000/api/platos";

            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error al guardar plato");

            const data = await res.json();

            // 2️⃣ Subir imagen SOLO si hay nueva
            if (imagenFile) {
                console.log("IMAGEN FILE:", imagenFile);
                const formData = new FormData();
                formData.append("imagen", imagenFile);

                const resImg = await fetch(
                    `http://localhost:3000/api/platos/${data.id}/imagen`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );


                if (!resImg.ok) {
                    const errorText = await resImg.text();
                    console.log("ERROR IMG:", errorText);
                } else {
                    const data = await resImg.json();
                    console.log("IMAGEN OK:", data);
                }
            }

            alert(isEditMode ? "Plato actualizado" : "Plato creado");

        } catch (error) {
            console.error(error);
            alert("Error en el proceso");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-2 h-full">
            <div className="p-10 max-w-6xl mx-auto h-full">

                <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row">

                    {/* IZQUIERDA */}
                    <div className="flex-1 p-8 md:p-12">

                        {/* HEADER */}
                        <div className="mb-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-800">
                                    Detalles del Plato
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    Crea o edita la información principal del plato
                                </p>
                            </div>

                            {/* SWITCHES */}
                            <div className="flex items-center gap-6 ml-auto bg-gray-100 px-4 py-2 rounded-full">

                                {/* DISPONIBLE */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">
                                        {esActivo ? "Disponible" : "No disponible"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setEsActivo(!esActivo)}
                                        className={`w-11 h-6 rounded-full relative transition ${esActivo ? "bg-green-600" : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${esActivo ? "right-1" : "left-1"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* MENU DEL DIA */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">
                                        {esMenuDelDia ? "Menú del día" : "Normal"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setEsMenuDelDia(!esMenuDelDia)}
                                        className={`w-11 h-6 rounded-full relative transition ${esMenuDelDia ? "bg-orange-600" : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${esMenuDelDia ? "right-1" : "left-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <Form onSubmit={handleSubmit} className="space-y-8">

                            {/* NOMBRE */}
                            <div>
                                <label className="text-xs font-bold uppercase text-orange-700">
                                    Nombre del plato
                                </label>
                                <input
                                    name="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full mt-2 p-3 text-lg border-b-2 focus:border-orange-600 outline-none"
                                />
                            </div>

                            {/* GRID */}
                            <div className="grid md:grid-cols-2 gap-8">

                                {/* CATEGORIA */}
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Categoría
                                    </label>
                                    <select
                                        name="rubroId"
                                        value={rubroId ?? ""}
                                        onChange={(e) =>
                                            setRubroId(e.target.value ? Number(e.target.value) : null)
                                        }
                                        className="w-full mt-2 p-3 bg-gray-100 rounded-lg"
                                    >
                                        <option value="">Seleccionar</option>
                                        {opcionesRubros.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PRECIO */}
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">
                                        Precio
                                    </label>
                                    <div className="relative mt-2">
                                        <span className="absolute left-3 top-3">$</span>
                                        <input
                                            name="precio"
                                            type="number"
                                            value={precio}
                                            onChange={(e) =>
                                                setPrecio(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                            className="w-full pl-8 p-3 bg-gray-100 rounded-lg text-xl font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* STOCK */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={esIlimitado}
                                        onChange={(e) =>
                                            handleIlimitadoChange(e.target.checked)
                                        }
                                    />
                                    Stock ilimitado
                                </label>

                                <input
                                    type="number"
                                    value={stockActual}
                                    disabled={esIlimitado}
                                    onChange={(e) =>
                                        setStockActual(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    className="p-2 border rounded w-32"
                                    placeholder="Stock"
                                />
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Descripción
                                </label>
                                <textarea
                                    rows={4}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full mt-2 p-3 bg-gray-100 rounded-lg"
                                />
                            </div>


                            {/* BOTONES */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded-lg hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"

                                    disabled={isSubmitting}
                                    className="bg-orange-600 text-white px-8 py-2 rounded-lg hover:bg-orange-700 transition"
                                >
                                    {isSubmitting ? "Guardando..." : "Guardar Plato"}
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* DERECHA (PREVIEW) */}
                    <div className="hidden lg:block w-96 p-6 bg-gray-100">

                        {/* IMAGEN */}
                        <div className="mt-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                                Presentación Visual
                            </label>

                            <div className="relative group cursor-pointer">

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center transition-all hover:bg-gray-100 hover:border-orange-400 aspect-square overflow-hidden">

                                    {imagenPreview ? (
                                        <div className="relative w-full h-full">

                                            <img
                                                src={imagenPreview}
                                                alt="preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />

                                            {/* OVERLAY */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition">
                                                Cambiar imagen
                                            </div>

                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-orange-600 text-3xl">
                                                        add_a_photo
                                                    </span>
                                                </div>

                                                <p className="text-sm font-bold text-gray-700">
                                                    Arrastrá una imagen o hacé click para subir
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    Recomendado: 800x800px
                                                </p>
                                            </div>
                                        </>
                                    )}

                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />

                            </div>
                        </div>



                        {/* PREVIEW TEXTO */}
                        <div className="bg-gray-900 text-white p-4 rounded-lg">
                            <h3 className="text-lg font-bold">
                                {nombre || "Vista previa"}
                            </h3>
                            <p className="text-sm opacity-80 mt-1">
                                {descripcion || "La descripción aparecerá acá"}
                            </p>
                        </div>

                        {/* CALENDARIO */}
                        <div className="bg-white text-black rounded-lg p-3 mt-4 flex flex-col items-center w-full">
                            <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                                Fecha disponible
                            </p>

                            <div className="w-full scale-85 origin-top">
                                <Calendar
                                    mode="single"
                                    selected={fechaDisponible}
                                    onSelect={setFechaDisponible}
                                    captionLayout="dropdown"
                                    className="rounded-md border w-full"
                                />
                            </div>
                        </div>

                    </div>



                </div>
            </div>
        </div >
    );
};
