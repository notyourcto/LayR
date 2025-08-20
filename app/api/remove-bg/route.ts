import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

export async function POST(req: NextRequest) {
  try {
    const cloudRunUrl = (process.env.CLOUD_RUN_URL || process.env.NEXT_PUBLIC_CLOUD_RUN_URL || "").replace(/\/$/, "");
    if (!cloudRunUrl) {
      return new Response(JSON.stringify({ error: "CLOUD_RUN_URL not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read incoming form-data and forward to Cloud Run as multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "Missing 'file' in form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const forward = new FormData();
    // Preserve filename and type if present
    const filename = (file as any).name || "upload.png";
    const type = (file as any).type || "image/png";
    forward.append("file", file, filename as any);

    const upstream = await fetch(`${cloudRunUrl}/process`, {
      method: "POST",
      body: forward as any,
      // Let fetch set the correct multipart boundary headers
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ error: "Cloud Run processing failed", status: upstream.status, details: text }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream/return the PNG back to client
    const arrayBuf = await upstream.arrayBuffer();
    return new Response(arrayBuf, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("/api/remove-bg error:", err);
    return new Response(JSON.stringify({ error: "Background removal failed", details: String(err?.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
 
