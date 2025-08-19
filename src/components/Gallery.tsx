// src/components/Gallery.tsx
import { useState } from "react";

export interface ImageData {
  id: string;
  url: string;
  title?: string;
}

export default function Gallery({ images }: { images: ImageData[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "scroll">("grid");
  const [selected, setSelected] = useState<ImageData | null>(null);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "scroll" : "grid")}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
        >
          {viewMode === "grid" ? "Visa som scroll" : "Visa som rutnät"}
        </button>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              className="cursor-pointer"
              onClick={() => setSelected(img)}
            >
              <img
                src={img.url}
                alt={img.title ?? ""}
                className="w-full h-32 object-cover rounded"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((img) => (
            <button
              key={img.id}
              className="cursor-pointer block w-full text-left"
              onClick={() => setSelected(img)}
            >
              <img
                src={img.url}
                alt={img.title ?? ""}
                className="w-full h-auto object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelected(null)}
        >
          <div className="relative bg-white rounded-lg p-4 max-w-3xl">
            <img
              src={selected.url}
              alt={selected.title ?? ""}
              className="w-full h-auto object-contain"
            />
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={() => setSelected(null)}
            >
              Stäng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
