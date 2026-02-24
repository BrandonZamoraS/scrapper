"use client";

import { useState, useRef } from "react";
import { UploadResult } from "@/types";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploaded(false);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Primero selecciona un archivo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result: UploadResult = await response.json();

      if (result.success && result.url) {
        setUploaded(true);
        onUploadSuccess(result.url);
      } else {
        setError(result.error || "Error al subir el archivo.");
      }
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        1. Sube la imagen del producto
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Preview */}
        <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
          {preview ? (
            <img
              src={preview}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-zinc-400">Sin imagen</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-zinc-400 dark:file:bg-blue-900/30 dark:file:text-blue-400"
          />

          <button
            onClick={handleUpload}
            disabled={loading || !preview}
            className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Subiendo..." : "Subir a Supabase"}
          </button>

          {uploaded && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              OK: Imagen subida correctamente
            </p>
          )}

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
