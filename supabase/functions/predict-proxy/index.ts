import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const backendUrl = (Deno.env.get("FLASK_BACKEND_URL") || "https://weed-vision-ai.onrender.com").replace(/\/+$/, "");
    console.log("Backend URL:", backendUrl);

    const contentType = req.headers.get("content-type") || "";
    console.log("Request content-type:", contentType);

    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const incoming = await req.formData();
      file = (incoming.get("file") ?? incoming.get("image")) as File | null;
    } else {
      // Handle case where body might be sent differently
      const incoming = await req.formData();
      file = (incoming.get("file") ?? incoming.get("image")) as File | null;
    }

    if (!file) {
      console.error("No file found in request");
      return new Response(JSON.stringify({ error: "Missing image file (expected field 'file' or 'image')." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type);

    const formData = new FormData();
    formData.append("file", file, file.name);

    console.log("Sending request to Flask backend...");
    
    const upstream = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: formData,
    });

    console.log("Flask response status:", upstream.status);
    
    const responseContentType = upstream.headers.get("content-type") || "application/json";
    const body = await upstream.text();
    
    console.log("Flask response body preview:", body.substring(0, 200));

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": responseContentType },
    });
  } catch (e) {
    console.error("predict-proxy error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error",
      details: e instanceof Error ? e.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
