import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Product, ApiResponse } from "@/types";

const APIFY_ACTOR_ID = "apify/google-shopping-scraper";

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

    // Run the Google Shopping Scraper actor synchronously
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`,
      {
        queries: imageUrl,
        countryCode: "us",
        languageCode: "en",
        maxItems: 15,
      },
      {
        params: { token: apiKey },
        headers: { "Content-Type": "application/json" },
        timeout: 120000, // Apify actors can take longer
      }
    );

    const products: Product[] = [];
    const results = Array.isArray(runResponse.data)
      ? runResponse.data
      : [];

    for (const item of results.slice(0, 15)) {
      products.push({
        title: item.title || item.name || "Unknown Product",
        price: item.price || item.extractedPrice
          ? `$${item.extractedPrice || item.price}`
          : "N/A",
        image: item.thumbnail || item.imageUrl || item.image || "",
        store: item.source || item.seller || item.merchantName || "Unknown Store",
        link: item.link || item.url || item.productUrl || "#",
      });
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
