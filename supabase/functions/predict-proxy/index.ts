import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const backendUrl = (Deno.env.get("FLASK_BACKEND_URL") || "https://weed-vision-ai.onrender.com").replace(/\/+$/, "");

    const incoming = await req.formData();
    const file = incoming.get("file") ?? incoming.get("image");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing image file (expected field 'file' or 'image')." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = new FormData();
    formData.append("file", file, file.name);

    const upstream = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: formData,
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": contentType },
    });
  } catch (e) {
    console.error("predict-proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
