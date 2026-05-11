import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @description Combina clases CSS condicionales y resuelve conflictos de Tailwind CSS.
 * @param {ClassValue[]} inputs - Lista de clases, objetos o valores condicionales aceptados por clsx.
 * @returns {string} Cadena final de clases CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Extrae el ID del rubro/categoria de un objeto Plato o similar.
 * @param {unknown} item - Objeto que puede contener rubroId, RubroId, rubro_id, rubro.id o Rubro.id.
 * @returns {number|null} ID numerico del rubro o null si no se encuentra.
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
