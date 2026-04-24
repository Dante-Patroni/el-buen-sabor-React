import { Button } from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export const PlatosPage = () => {
  const navigate = useNavigate();

  //Hardcodeamos algunos platos para mostrar en la tabla, en una app real esto vendría de una API o base de datos
  const platos = [
    {
      id: 1,
      nombre: "Hamburguesa",
      precio: 5000,
      stock: 10,
      esActivo: true,
      rubro: { nombre: "Platos Fuertes" },
    },
    {
      id: 2,
      nombre: "Ensalada Caesar",
      precio: 3500,
      stock: 5,
      esActivo: true,
      rubro: { nombre: "Entradas" },
    },
    {
      id: 3,
      nombre: "Volcán de Chocolate",
      precio: 2500,
      stock: 0,
      esActivo: false,
      rubro: { nombre: "Postres" },
    },
  ];
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
        <select className="flex-1 border rounded p-2">
          <option>Todas las categorías</option>
        </select>

        <select className="flex-1 border rounded p-2">
          <option>Cualquier estado</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-xl font-bold">42</p>
        <p className="text-sm text-gray-500">Total platos</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-xl font-bold">38</p>
        <p className="text-sm text-gray-500">Disponibles</p>
      </div>
    </div>

    {/* TABLA */}
    <div className="bg-white p-4 rounded shadow">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Nombre</th>
            <th className="py-2">Categoría</th>
            <th className="py-2">Precio</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>

        <tbody>
          {platos.map((plato) => (
            <tr
              key={plato.id}
              onClick={() => navigate(`/cocina/platos/${plato.id}`)}
              className="cursor-pointer border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />

                  <div>
                    <p className="font-semibold">{plato.nombre}</p>
                    <p className="text-sm text-gray-500">
                      Descripción del plato...
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-4">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {plato.rubro.nombre}
                </span>
              </td>

              <td className="px-4 py-4 font-semibold">
                ${plato.precio}
              </td>

              <td className="px-4 py-4">
                {plato.stock}
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      plato.esActivo ? "bg-green-500" : "bg-red-500"
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
