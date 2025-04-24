
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { parse } from "https://deno.land/std@0.208.0/csv/parse.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductData {
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  category_id?: string;
  sku: string;
  quantity_in_stock: number;
  is_active?: boolean;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (userError || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    // Read the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Check file type
    if (!file.name.endsWith(".csv")) {
      return new Response(JSON.stringify({ error: "Only CSV files are supported" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Read and parse CSV content
    const csvContent = await file.text();
    const parsedData = parse(csvContent, { skipFirstRow: true, columns: true });
    
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid or empty CSV file" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Process products
    const products: ProductData[] = [];
    const errors: { row: number; message: string }[] = [];
    
    parsedData.forEach((row: Record<string, string>, index: number) => {
      try {
        // Required fields validation
        if (!row.name || !row.price || !row.sku) {
          errors.push({ row: index + 2, message: "Missing required fields (name, price, sku)" });
          return;
        }
        
        // Generate slug if not provided
        const slug = row.slug || row.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
        
        // Parse numeric values
        const price = parseFloat(row.price);
        const sale_price = row.sale_price ? parseFloat(row.sale_price) : undefined;
        const quantity_in_stock = row.quantity_in_stock ? parseInt(row.quantity_in_stock, 10) : 0;
        
        // Validate numeric values
        if (isNaN(price) || price <= 0) {
          errors.push({ row: index + 2, message: "Invalid price" });
          return;
        }
        
        if (sale_price !== undefined && (isNaN(sale_price) || sale_price <= 0)) {
          errors.push({ row: index + 2, message: "Invalid sale price" });
          return;
        }
        
        if (isNaN(quantity_in_stock) || quantity_in_stock < 0) {
          errors.push({ row: index + 2, message: "Invalid quantity" });
          return;
        }
        
        // Create product object
        const product: ProductData = {
          name: row.name,
          description: row.description || "",
          price,
          sale_price,
          sku: row.sku,
          quantity_in_stock,
          slug,
          is_active: row.is_active?.toLowerCase() === "true" || row.is_active === "1",
          meta_title: row.meta_title || row.name,
          meta_description: row.meta_description || row.description?.substring(0, 150) || "",
        };
        
        // Add category if provided
        if (row.category_id) {
          product.category_id = row.category_id;
        }
        
        products.push(product);
      } catch (error) {
        errors.push({ row: index + 2, message: `Processing error: ${error.message}` });
      }
    });
    
    // If all rows have errors, return error
    if (products.length === 0) {
      return new Response(JSON.stringify({ 
        error: "All rows contain errors", 
        details: errors
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Insert products to database
    const { data, error: insertError } = await supabase.from("products").insert(products).select("id, name");
    
    if (insertError) {
      return new Response(JSON.stringify({ 
        error: "Error inserting products", 
        details: insertError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action_type: "bulk_product_import",
      details: {
        count: products.length,
        errors: errors.length,
        filename: file.name
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      imported: products.length,
      errors: errors.length > 0 ? errors : undefined,
      products: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Bulk product upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
