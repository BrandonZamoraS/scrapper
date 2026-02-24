import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Product, ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "SerpApi API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Lens API via SerpApi
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_lens",
        url: imageUrl,
        api_key: apiKey,
      },
      timeout: 30000,
    });

    const products: Product[] = [];

    // Parse visual matches
    const visualMatches = response.data?.visual_matches || [];
    for (const match of visualMatches.slice(0, 15)) {
      products.push({
        title: match.title || "Unknown Product",
        price: match.price?.extracted_value
          ? `$${match.price.extracted_value}`
          : match.price?.value || "N/A",
        image: match.thumbnail || match.image || "",
        store: match.source || match.domain || "Unknown Store",
        link: match.link || "#",
      });
    }

    // Also parse shopping results if available
    const shoppingResults = response.data?.shopping_results || [];
    for (const item of shoppingResults.slice(0, 10)) {
      products.push({
        title: item.title || "Unknown Product",
        price: item.extracted_price
          ? `$${item.extracted_price}`
          : item.price || "N/A",
        image: item.thumbnail || item.image || "",
        store: item.source || item.seller || "Unknown Store",
        link: item.link || item.product_link || "#",
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
    });
  } catch (error) {
    const message =
      axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";

    return NextResponse.json<ApiResponse>(
      { success: false, error: `SerpApi error: ${message}` },
      { status: 500 }
    );
  }
}
