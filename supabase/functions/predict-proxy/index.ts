import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonBody = {
  filename?: string;
  mimeType?: string;
  base64?: string; // raw base64 (no data: prefix)
  dataUrl?: string; // full data URL
};

function dataUrlToParts(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid dataUrl format");
  return { mimeType: match[1], base64: match[2] };
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let backendUrl = (
      // Prefer non-VITE secret for server-side/edge usage
      Deno.env.get("FLASK_BACKEND_URL") ||
      Deno.env.get("VITE_FLASK_API_URL") ||
      "https://backend-rid6.onrender.com"
    ).replace(/\/+$/, "");

    // Allow secrets to be set as either base URL or full /predict URL.
    backendUrl = backendUrl.replace(/\/predict\/?$/, "");

    const contentType = req.headers.get("content-type") || "";

    console.log("predict-proxy: incoming content-type:", contentType);
    console.log("predict-proxy: backendUrl:", backendUrl);

    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const incoming = await req.formData();
      const f = incoming.get("file") ?? incoming.get("image");
      file = f instanceof File ? f : null;
    } else {
      // JSON path (recommended for supabase.functions.invoke)
      const body = (await req.json()) as JsonBody;
      const filename = body.filename || "upload.jpg";

      let mimeType = body.mimeType || "application/octet-stream";
      let base64 = body.base64;

      if (!base64 && body.dataUrl) {
        const parts = dataUrlToParts(body.dataUrl);
        mimeType = parts.mimeType;
        base64 = parts.base64;
      }

      if (!base64) {
        return new Response(JSON.stringify({ error: "Missing image data (expected base64 or dataUrl)." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bytes = base64ToUint8Array(base64);
      // Create a real ArrayBuffer copy (avoids SharedArrayBuffer typing issues).
      const arrayBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(arrayBuffer).set(bytes);
      const blob = new Blob([arrayBuffer], { type: mimeType });
      file = new File([blob], filename, { type: mimeType });
    }

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing image file (expected field 'file' or 'image')." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("predict-proxy: received file:", file.name, file.size, file.type);

    // Forward to Flask; include BOTH keys to match different backends.
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("image", file, file.name);

    const upstream = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: formData,
    });

    const upstreamContentType = upstream.headers.get("content-type") || "";
    const upstreamText = await upstream.text();

    console.log("predict-proxy: upstream status:", upstream.status);
    console.log("predict-proxy: upstream content-type:", upstreamContentType || "(none)");
    console.log("predict-proxy: upstream body preview:", upstreamText.slice(0, 200));

    // If backend returns non-JSON (often HTML error pages), wrap it into JSON so the client can parse it.
    const looksJson = upstreamContentType.toLowerCase().includes("application/json");
    if (!upstream.ok || !looksJson) {
      return new Response(
        JSON.stringify({
          error: "Upstream backend error",
          upstream_status: upstream.status,
          upstream_content_type: upstreamContentType || null,
          upstream_body_preview: upstreamText.slice(0, 500),
        }),
        {
          status: upstream.status || 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(upstreamText, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-proxy error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
