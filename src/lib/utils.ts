import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de Tailwind CSS de forma segura.
 * Resuelve conflictos entre clases y permite valores condicionales.
 * 
 * @example
 * cn("bg-red-500", { "text-white": isActive }, "p-4")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extrae el ID del rubro/categoría de un objeto Plato o similar.
 * Maneja las diferentes variantes de nomenclatura que puede devolver el backend.
 * 
 * @param item - Objeto que puede contener rubroId, RubroId, rubro.id, etc.
 * @returns El ID numérico del rubro o null si no se encuentra.
 */
export function extractRubroId(item: unknown): number | null {
  if (!item || typeof item !== 'object') return null;
  
  const obj = item as Record<string, unknown>;
  if (obj.rubroId) return Number(obj.rubroId);
  if (obj.RubroId) return Number(obj.RubroId);
  if (obj.rubro_id) return Number(obj.rubro_id);
  
  const rubro = obj.rubro ?? obj.Rubro;
  if (rubro && typeof rubro === 'object' && rubro !== null) {
    return Number((rubro as Record<string, unknown>).id);
  }
  return null;
}
