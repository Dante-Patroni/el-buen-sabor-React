import { useLoaderData } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Plato, Rubro } from "../../types";
import { authFetch } from "@/lib/authFetch";
import { RequirePermiso } from "@/auth/RequirePermiso";
import { PLATO_CREAR } from "@/auth/permisos";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { Table, TableHead, TableRow } from "@/components/ui/Table";

/**
 * @description Renderiza el catalogo de platos con filtros por categoria y estado.
 * @returns {JSX.Element} Pagina de administracion de platos.
 */
export const PlatosPage = () => {
  const navigate = useNavigate();
  const platos = useLoaderData() as Plato[];
  const API_URL = import.meta.env.VITE_API_URL;

  const [categoriaFiltro, setCategoriaFiltro] = useState<number | "">("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");
  const [rubros, setRubros] = useState<Rubro[]>([]);

  // Fetch de rubros para los filtros
  useEffect(() => {
    authFetch("/api/rubros")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Error al cargar rubros");
        }

        return res.json();
      })
      .then((data) => setRubros(data))
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Genera opciones de filtro incluyendo subrubros
  const opcionesRubros = rubros.flatMap((padre) => {
    const opciones = [{ id: padre.id, label: padre.denominacion }];
    const subrubros = (padre.subrubros || []).map((hijo) => ({
      id: hijo.id,
      label: `${padre.denominacion} / ${hijo.denominacion}`,
    }));
    return [...opciones, ...subrubros];
  });

  // Filtra platos por categoría y estado
  const platosFiltrados = platos.filter((p) => {
    const matchCategoria = !categoriaFiltro || p.rubroId === categoriaFiltro;
    const matchEstado =
      !estadoFiltro ||
      (estadoFiltro === "activo" && p.esActivo) ||
      (estadoFiltro === "inactivo" && !p.esActivo);

    return matchCategoria && matchEstado;
  });

  // Métricas para el dashboard
  const totalPlatos = platosFiltrados.length;
  const disponibles = platosFiltrados.filter(p => p.esActivo).length;

  return (
    <PageContainer>
      <PageHeader
        title="Catálogo de Platos"
        description="Administra tu menú, precios y disponibilidad en tiempo real."
        action={
          <div className="w-52">
            <RequirePermiso permisos={[PLATO_CREAR]}>
              <Button
                onClick={() => navigate("/cocina/platos/nuevo")}
                variant="destructive"
              >
                Agregar Plato
              </Button>
            </RequirePermiso>
          </div>
        }
      />

      {/* FILTROS Y MÉTRICAS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 bg-white p-4 rounded-xl shadow flex gap-4">
          <Select
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
          </Select>

          <Select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Cualquier estado</option>
            <option value="activo">Disponible</option>
            <option value="inactivo">No Disponible</option>
          </Select>

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

      {/* TABLA DE PLATOS */}
      <div className="bg-white p-4 rounded-xl">
        <Table>
          <TableHead className="border-gray-300">
            <th className="py-2">Nombre</th>
            <th className="py-2">Categoría</th>
            <th className="py-2">Precio</th>
            <th className="py-2">Es Menu del dia</th>
            <th className="py-2">StockActual</th>
            <th className="py-2">Es Disponible</th>
          </TableHead>

          <tbody>
            {platosFiltrados.map((plato) => (
              <TableRow
                key={plato.id}
                onClick={() =>
                  navigate(`/cocina/platos/${plato.id}`, {
                    state: {
                      rubroId: plato.rubroId,
                      rubroDenominacion: String(plato.rubro?.denominacion ?? ""),
                    },
                  })
                }
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    {plato.imagenPath && (
                      <img
                        src={`${API_URL}${plato.imagenPath.replace(/\\/g, "/")}`}
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
                  {plato.esIlimitado ? "Ilimitado" : plato.stockActual}
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
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

    </PageContainer>
  );
}
