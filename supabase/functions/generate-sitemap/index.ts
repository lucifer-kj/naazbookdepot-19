
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get request body
  const { baseUrl } = await req.json();
  
  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: "baseUrl is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Static pages
    const staticPages = [
      "", // Homepage
      "/books",
      "/perfumes",
      "/essentials",
      "/about",
      "/blog",
      "/faq",
      "/contact",
      "/cart",
      "/login",
      "/register",
      "/forgot-password",
    ];

    // Fetch dynamic products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, slug")
      .eq("is_active", true);

    if (productsError) {
      throw productsError;
    }

    // Fetch blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");

    if (blogError) {
      throw blogError;
    }

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    });

    // Add product pages
    products.forEach((product: any) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.slug || product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add blog post pages
    blogPosts.forEach((post: any) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Close sitemap
    sitemap += `
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: { 
        "Content-Type": "application/xml",
        ...corsHeaders 
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
