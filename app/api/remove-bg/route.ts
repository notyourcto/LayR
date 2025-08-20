import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

export async function POST(req: NextRequest) {
  try {
    const { removeBackground } = await import("@imgly/background-removal-node");
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "Missing 'file' in form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const input = new Uint8Array(arrayBuffer);

    // Determine MIME type (prefer client-provided, fallback to magic bytes)
    const mimeFromClient = (file as any).type as string | undefined;
    const mime = mimeFromClient || detectMime(input) || 'image/png';

    // Create a Blob with explicit MIME so the library can detect format
    const blobInput = new Blob([input], { type: mime });

    // Process with IMG.LY Node library on the server
    const output: any = await removeBackground(blobInput as any);

    // Normalize to Uint8Array for Response body
    let body: Uint8Array;
    if (output instanceof Uint8Array) {
      body = output;
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(output)) {
      body = new Uint8Array(output);
    } else if (output instanceof ArrayBuffer) {
      body = new Uint8Array(output);
    } else if (output && typeof output.arrayBuffer === 'function') {
      const ab = await output.arrayBuffer();
      body = new Uint8Array(ab);
    } else {
      throw new Error('Unexpected output type from removeBackground');
    }

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // allow caching of result for some time if desired
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

// Simple MIME detection from magic bytes
function detectMime(buf: Uint8Array): string | undefined {
  if (buf.length >= 8) {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
    ) return 'image/png';
  }
  if (buf.length >= 3) {
    // JPEG: FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  }
  if (buf.length >= 12) {
    // WebP: RIFF....WEBP
    if (
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    ) return 'image/webp';
  }
  return undefined;
}
