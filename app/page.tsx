"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import ApiTabs from "@/components/ApiTabs";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Price Scraper Demo
          </h1>
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
            Upload a product image and compare prices across SearchApi.io, SerpApi &amp; Apify
          </p>
        </header>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
          <ApiTabs imageUrl={imageUrl} />
        </div>
      </div>
    </div>
  );
}
