import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * @description Controles de paginacion (anterior, numeros, siguiente) con el estilo estandar de listados.
 */
export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      className="flex size-8 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ChevronLeft className="size-4" />
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onPageChange(n)}
        className={
          "flex size-8 items-center justify-center rounded-xl text-sm font-semibold transition " +
          (n === page
            ? "bg-red-800 text-white"
            : "border border-stone-200 text-stone-600 hover:bg-stone-50")
        }
      >
        {n}
      </button>
    ))}

    <button
      type="button"
      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      className="flex size-8 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ChevronRight className="size-4" />
    </button>
  </div>
);
