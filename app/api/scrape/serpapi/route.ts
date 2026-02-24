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
      let price = "N/A";
      if (match.extracted_price != null) {
        const currency = match.currency === "USD" ? "$" : (match.currency || "$");
        price = `${currency}${match.extracted_price}`;
      } else if (typeof match.price === "string" && match.price) {
        price = match.price;
      } else if (match.price?.extracted_value != null) {
        price = `$${match.price.extracted_value}`;
      } else if (match.price?.value) {
        price = match.price.value;
      }

      const image = match.thumbnail
        || (typeof match.image === "object" ? match.image?.link : match.image)
        || "";

      products.push({
        title: match.title || "Unknown Product",
        price,
        image,
        store: match.source || match.domain || "Unknown Store",
        link: match.link || "#",
      });
    }

    // Also parse shopping results if available
    const shoppingResults = response.data?.shopping_results || [];
    for (const item of shoppingResults.slice(0, 10)) {
      let price = "N/A";
      if (item.extracted_price != null) {
        price = `$${item.extracted_price}`;
      } else if (item.price) {
        price = item.price;
      }

      products.push({
        title: item.title || "Unknown Product",
        price,
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
