import { useLoaderData } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
// Tipo que coincide con lo que devuelve el loader en routes.tsx
interface Plato {
  imagenPath: any;
  id: number;
  nombre: string;
  descripcion: string;
  esMenuDelDia: boolean;
  esIlimitado: boolean;
  precio: number;
  stockActual: number;
  esActivo: boolean;
  rubro: {
    denominacion: ReactNode; nombre: string
  };
  rubroId: number;
}

export const PlatosPage = () => {
  const navigate = useNavigate();
  const platos = useLoaderData() as Plato[];

  // 🔹 estados
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | "">("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");
  const [rubros, setRubros] = useState<any[]>([]);

  // 🔹 fetch rubros
  useEffect(() => {
    fetch("http://localhost:3000/api/rubros")
      .then(res => res.json())
      .then(data => setRubros(data));
  }, []);

  // 🔹 opciones
  const opcionesRubros = rubros.flatMap((padre) => {
    const opciones = [{ id: padre.id, label: padre.denominacion }];
    const subrubros = (padre.subrubros || []).map((hijo) => ({
      id: hijo.id,
      label: `${padre.denominacion} / ${hijo.denominacion}`,
    }));
    return [...opciones, ...subrubros];
  });

  // 🔹 filtros
  const platosFiltrados = platos.filter((p) => {
    const matchCategoria =
      !categoriaFiltro || p.rubroId === categoriaFiltro;

    const matchEstado =
      !estadoFiltro ||
      (estadoFiltro === "activo" && p.esActivo) ||
      (estadoFiltro === "inactivo" && !p.esActivo);

    return matchCategoria && matchEstado;
  });

  // 🔹 métricas
  const totalPlatos = platosFiltrados.length;
  const disponibles = platosFiltrados.filter(p => p.esActivo).length;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-yellow-700">
            Catálogo de Platos
          </h2>
          <p className="text-gray-500">
            Administra tu menú, precios y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="w-52">
          <Button
            onClick={() => navigate("/cocina/platos/nuevo")}
            variant="warning"
          >
            Agregar Plato
          </Button>
        </div>
      </div> {/* 👈 ACÁ se cierra el header */}

      {/* FILTROS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 bg-white p-4 rounded-xl shadow flex gap-4">
          <select
            value={categoriaFiltro}
            onChange={(e) =>
              setCategoriaFiltro(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Todas las categorías</option>
            {opcionesRubros.map(r => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Cualquier estado</option>
            <option value="activo">Disponible</option>
            <option value="inactivo">No Disponible</option>
          </select>

        </div>

        <div className="bg-gray-200 p-4 rounded-xl shadow">
          <p className="text-xl font-bold">{totalPlatos}</p>
          <p className="text-sm text-gray-500">Total platos</p>
        </div>

        <div className="bg-gray-200 p-4 rounded-xl shadow">
          <p className="text-xl font-bold">{disponibles}</p>
          <p className="text-sm text-gray-500">Disponibles</p>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white p-4 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2">Nombre</th>
              <th className="py-2">Categoría</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Es Menu del dia</th>
              <th className="py-2">StockActual</th>
              <th className="py-2">Es Disponible</th>
            </tr>
          </thead>

          <tbody>
            {platosFiltrados.map((plato) => (
              <tr
                key={plato.id}
                onClick={() =>
                  navigate(`/cocina/platos/${plato.id}`, {
                    state: {
                      rubroId: plato.rubroId,
                      rubroDenominacion: String(plato.rubro?.denominacion ?? ""),
                    },
                  })
                }
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    {plato.imagenPath && (
                      <img
                        src={`http://localhost:3000${plato.imagenPath}`}
                        alt={plato.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}

                    <div>
                      <p className="font-semibold">{plato.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {plato.descripcion}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {plato.rubro?.denominacion}
                  </span>
                </td>

                <td className="px-4 py-4 font-semibold">
                  ${plato.precio}
                </td>

                <td className="px-4 py-4">
                  {plato.esMenuDelDia ? "Sí" : "No"}
                </td>


                <td className="px-4 py-4">
                  {plato.esIlimitado ? "∞ Ilimitado" : plato.stockActual}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${plato.esActivo ? "bg-green-500" : "bg-red-500"
                        }`}
                    />
                    <span className="text-sm">
                      {plato.esActivo ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
