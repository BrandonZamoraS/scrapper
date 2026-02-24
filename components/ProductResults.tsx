"use client";

import { Product } from "@/types";

interface ProductResultsProps {
  products: Product[];
  loading: boolean;
}

export default function ProductResults({ products, loading }: ProductResultsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-zinc-500">Buscando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        Aun no hay resultados. Sube una imagen y haz clic en &quot;Buscar precios&quot;.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
        >
          {/* Product Image */}
          <div className="flex h-40 items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).alt = "Imagen no disponible";
                }}
              />
            ) : (
              <span className="text-xs text-zinc-400">Sin imagen</span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {product.title}
            </h3>

            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {product.price}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {product.store}
            </p>

            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver producto
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
