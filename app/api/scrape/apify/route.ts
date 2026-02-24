import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Product, ApiResponse } from "@/types";

const APIFY_ACTOR_ID = "borderline/google-lens";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Apify API key not configured" },
        { status: 500 }
      );
    }

    // Run the Google Lens actor synchronously
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR_ID)}/run-sync-get-dataset-items`,
      {
        imageUrls: [{ url: imageUrl }],
        searchTypes: ["products", "visual-match"],
        language: "en",
      },
      {
        params: { token: apiKey, timeout: 120 },
        headers: { "Content-Type": "application/json" },
        timeout: 130000,
      }
    );

    const products: Product[] = [];
    const items = Array.isArray(runResponse.data) ? runResponse.data : [];

    for (const item of items) {
      // Parse "products" results: { title, price, vendor, link, thumbnail }
      if (item.products?.results) {
        for (const p of item.products.results.slice(0, 15)) {
          products.push({
            title: p.title || "Unknown Product",
            price: p.price || "N/A",
            image: p.thumbnail || "",
            store: p.vendor || "Unknown Store",
            link: p.link || "#",
          });
        }
      }

      // Parse "visual-match" results: { search: { title, href, description } }
      if (item["visual-match"]?.results) {
        for (const vm of item["visual-match"].results.slice(0, 15)) {
          const search = vm.search;
          if (!search) continue;

          // Extract store name from the beginning of title (e.g. "Amazon.comProduct Title")
          let store = "Unknown Store";
          let title = search.title || search.description || "Unknown Product";

          // The title often starts with the store domain
          const knownStores = [
            "Amazon.com", "Amazon", "Walmart", "IKEA", "Wayfair",
            "Overstock.com", "Target", "Home Depot", "Costway", "Etsy",
          ];
          for (const s of knownStores) {
            if (title.startsWith(s)) {
              store = s;
              title = title.substring(s.length).replace(/^[\s\-–—·:]+/, "").trim() || title;
              break;
            }
          }

          // Try to extract store from href domain
          if (store === "Unknown Store" && search.href?.startsWith("http")) {
            try {
              const domain = new URL(search.href).hostname.replace("www.", "");
              store = domain;
            } catch { /* ignore */ }
          }

          products.push({
            title,
            price: "N/A",
            image: "",
            store,
            link: search.href?.startsWith("http") ? search.href : "#",
          });
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
    });
  } catch (error) {
    const message =
      axios.isAxiosError(error)
        ? error.response?.data?.error?.message ||
          error.response?.data?.error ||
          error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";

    return NextResponse.json<ApiResponse>(
      { success: false, error: `Apify error: ${message}` },
      { status: 500 }
    );
  }
}
