import { useState, useEffect } from "react";
import {
    Form,
    useLoaderData,
    useLocation,
    useNavigation,
    useActionData,
    useNavigate,
} from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import type { Plato, Rubro } from "@/types";
import { extractRubroId } from "@/lib/utils";
import { Heading } from "@/components/ui/Heading";
import { Alert } from "@/components/ui/Alert";

/**
 * @description Renderiza el formulario para crear o editar platos usando actions/loaders de React Router.
 * @returns {JSX.Element} Pagina de formulario de plato.
 */
export const PlatoFormPage = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
    const [descripcion, setDescripcion] = useState("");
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [rubroId, setRubroId] = useState<number | null>(null);
    const [stockActual, setStockActual] = useState<number | "">("");
    const [esIlimitado, setEsIlimitado] = useState(false);
    const [esMenuDelDia, setEsMenuDelDia] = useState(false);
    const [esActivo, setEsActivo] = useState(true);
    const [fechaDisponible, setFechaDisponible] = useState<Date | undefined>(undefined);
    
    const plato = useLoaderData() as Plato | null;
    const navigation = useNavigation();
    const actionData = useActionData() as { error?: string } | undefined;
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";
    
    const location = useLocation();
    const navState = (location.state as { rubroId?: number; rubroDenominacion?: string } | null);
    const rubroIdFromList = navState?.rubroId;
    const rubroDenominacionFromList = navState?.rubroDenominacion;
    const isEditMode = Boolean(plato?.id);
    
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);

    /**
     * @description Genera una URL temporal para previsualizar la imagen seleccionada.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input file.
     * @returns {void} No retorna valor; actualiza la previsualizacion de imagen.
     */
    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagenPreview(url);
    };

    /**
     * @description Actualiza el modo de stock ilimitado y limpia el stock manual si se activa.
     * @param {boolean} checked - Indica si el stock ilimitado queda activado.
     * @returns {void} No retorna valor; actualiza el estado local del formulario.
     */
    const handleIlimitadoChange = (checked: boolean) => {
        setEsIlimitado(checked);
        if (checked) setStockActual("");
    };

    useEffect(() => {
        fetch(`${API_URL}/api/rubros`)
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

    /**
     * @description Busca el ID de un subrubro a partir de su denominacion.
     * @param {string|null|undefined} denominacion - Nombre del subrubro recibido desde navegacion o backend.
     * @returns {number|null} ID del subrubro encontrado o null si no hay coincidencia.
     */
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
        if (plato && plato.id) {
            setNombre(plato.nombre);
            setPrecio(Number(plato.precio));
            setDescripcion(plato.descripcion);
            setEsMenuDelDia(plato.esMenuDelDia);
            setEsIlimitado(plato.esIlimitado);
            setStockActual(plato.stockActual ?? "");
            if (plato.imagenPath) {
                setImagenPreview(`${API_URL}${plato.imagenPath}`);
            }
            setEsActivo(plato.esActivo);
            
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
    }, [plato?.id]);

    return (
        <div className="pt-2 h-full">
            <div className="p-10 max-w-7xl mx-auto h-full">
                <Form method="post" encType="multipart/form-data" onSubmit={(e) => {
                    if (rubroId === null) {
                        e.preventDefault();
                        alert("Seleccioná una categoría");
                    }
                }} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
                    
                    <input type="hidden" name="esActivo" value={esActivo ? "on" : ""} />
                    <input type="hidden" name="esMenuDelDia" value={esMenuDelDia ? "on" : ""} />
                    <input type="hidden" name="esIlimitado" value={esIlimitado ? "on" : ""} />

                    {/* IZQUIERDA - Formulario */}
                    <div className="flex-[2] p-8 md:p-12">
                        <div className="mb-10 flex justify-between items-start">
                            <div>
                                <Heading as="h2" className="text-3xl font-extrabold">
                                    {isEditMode ? "Editar Plato" : "Nuevo Plato"}
                                </Heading>
                                <p className="text-gray-500 mt-1">
                                    Crea o edita la información principal del plato
                                </p>
                            </div>

                            <div className="flex items-center gap-6 ml-auto bg-gray-100 px-4 py-2 rounded-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">
                                        {esActivo ? "Disponible" : "No disponible"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEsActivo(!esActivo)}
                                        className={`w-11 h-6 rounded-full relative transition ${esActivo ? "bg-green-600" : "bg-gray-300"}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${esActivo ? "right-1" : "left-1"}`} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase">
                                        {esMenuDelDia ? "Menú del día" : "Normal"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEsMenuDelDia(!esMenuDelDia)}
                                        className={`w-11 h-6 rounded-full relative transition ${esMenuDelDia ? "bg-orange-600" : "bg-gray-300"}`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${esMenuDelDia ? "right-1" : "left-1"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {actionData?.error && (
                            <Alert className="mb-4">{actionData.error}</Alert>
                        )}
                        
                        <div className="space-y-8">
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

                            <div className="grid md:grid-cols-2 gap-8">
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
                                    name="stockActual"
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

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    rows={4}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full mt-2 p-3 bg-gray-100 rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate("/cocina/platos")}
                                    className="px-6 py-2 rounded-lg hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-600 text-white px-8 py-2 rounded-lg hover:bg-orange-700 transition"
                                >
                                    {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar Plato" : "Crear Plato"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DERECHA - Panel de preview */}
                    <div className="hidden lg:block w-80 p-6 bg-gray-100">
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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition">
                                                Cambiar imagen
                                            </div>
                                        </div>
                                    ) : (
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
                                    )}
                                </div>

                                <input
                                    type="file"
                                    name="imagen"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-4 rounded-lg mt-4">
                            <h3 className="text-lg font-bold">
                                {nombre || "Vista previa"}
                            </h3>
                            <p className="text-sm opacity-80 mt-1">
                                {descripcion || "La descripción aparecerá acá"}
                            </p>
                        </div>

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
                </Form>
            </div>
        </div>
    );
};
