"use client";

import { useState, useEffect } from "react";
import { Product, ApiResponse } from "@/types";
import ProductResults from "./ProductResults";

const TABS = [
  { id: "searchapi", label: "SearchApi.io", endpoint: "/api/scrape/searchapi" },
  { id: "serpapi", label: "SerpApi", endpoint: "/api/scrape/serpapi" },
  { id: "apify", label: "Apify", endpoint: "/api/scrape/apify" },
] as const;

interface ApiTabsProps {
  imageUrl: string;
}

export default function ApiTabs({ imageUrl }: ApiTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const [results, setResults] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [inputUrl, setInputUrl] = useState(imageUrl);

  // Sync when parent passes a new URL
  useEffect(() => {
    if (imageUrl) {
      setInputUrl(imageUrl);
    }
  }, [imageUrl]);

  const handleSearch = async (tabId: string, endpoint: string) => {
    const urlToSearch = inputUrl.trim();
    if (!urlToSearch) return;

    setLoading((prev) => ({ ...prev, [tabId]: true }));
    setErrors((prev) => ({ ...prev, [tabId]: null }));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: urlToSearch }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setResults((prev) => ({ ...prev, [tabId]: data.data! }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [tabId]: data.error || "Unknown error occurred",
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [tabId]: "Network error. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [tabId]: false }));
    }
  };

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-6 pb-0 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          2. Search for Prices
        </h2>

        {/* URL Input */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Image URL (auto-filled after upload)"
            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={() => handleSearch(activeTab, activeTabData.endpoint)}
            disabled={!inputUrl.trim() || loading[activeTab]}
            className="whitespace-nowrap rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading[activeTab] ? "Searching..." : "Search Prices"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {results[tab.id]?.length ? (
                <span className="ml-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {results[tab.id].length}
                </span>
              ) : null}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {errors[activeTab] && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errors[activeTab]}
          </div>
        )}

        <ProductResults
          products={results[activeTab] || []}
          loading={loading[activeTab] || false}
        />
      </div>
    </div>
  );
}
