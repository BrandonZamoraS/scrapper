import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Product, ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "La URL de la imagen es obligatoria." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SEARCHAPI_KEY;
    if (!apiKey) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No se configuro la clave API de SearchApi.io." },
        { status: 500 }
      );
    }

    // Use Google Shopping search with reverse image
    const response = await axios.get("https://www.searchapi.io/api/v1/search", {
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
      // Price can be: match.extracted_price (number), match.price (string like "$132*")
      let price = "No disponible";
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

      // Image can be: match.thumbnail (string), match.image.link (object), or match.image (string)
      const image = match.thumbnail
        || (typeof match.image === "object" ? match.image?.link : match.image)
        || "";

      products.push({
        title: match.title || "Producto desconocido",
        price,
        image,
        store: match.source || match.domain || "Tienda desconocida",
        link: match.link || "#",
      });
    }

    // Also parse shopping results if available
    const shoppingResults = response.data?.shopping_results || [];
    for (const item of shoppingResults.slice(0, 10)) {
      let price = "No disponible";
      if (item.extracted_price != null) {
        price = `$${item.extracted_price}`;
      } else if (item.price) {
        price = item.price;
      }

      products.push({
        title: item.title || "Producto desconocido",
        price,
        image: item.thumbnail || item.image || "",
        store: item.source || item.seller || "Tienda desconocida",
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
          : "Error desconocido";

    return NextResponse.json<ApiResponse>(
      { success: false, error: `Error de SearchApi.io: ${message}` },
      { status: 500 }
    );
  }
}

