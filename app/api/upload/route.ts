import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, BUCKET_NAME } from "@/lib/supabase";
import { UploadResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<UploadResult>(
        { success: false, error: "No se proporciono ningun archivo." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json<UploadResult>(
        { success: false, error: "Tipo de archivo invalido. Permitidos: JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json<UploadResult>(
        { success: false, error: `Error al subir el archivo: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json<UploadResult>({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json<UploadResult>(
      { success: false, error: `Error del servidor: ${message}` },
      { status: 500 }
    );
  }
}
