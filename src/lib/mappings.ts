import type { Rol } from "@/types";

export const ROL_BADGE_STYLES: Record<string, string> = {
  admin: "bg-orange-100 text-orange-700",
  superadmin: "bg-stone-800 text-white",
  cocinero: "bg-stone-200 text-stone-700",
  mozo: "bg-rose-100 text-rose-700",
  cajero: "bg-amber-100 text-amber-700",
};

export const getRolBadgeClass = (rol: string): string =>
  ROL_BADGE_STYLES[rol] ?? "bg-stone-100 text-stone-700";

export const ROLES_HARDCODED: Rol[] = [
  { id: 1, nombre: "superadmin", descripcion: "Acceso total al sistema" },
  { id: 2, nombre: "admin", descripcion: "Administrador del restaurante" },
  { id: 3, nombre: "cajero", descripcion: "Operador de caja" },
  { id: 4, nombre: "cocinero", descripcion: "Operador de cocina" },
  { id: 5, nombre: "mozo", descripcion: "Atención de mesas y pedidos" },
];
