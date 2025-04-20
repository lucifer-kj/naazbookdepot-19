
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const requestData = await req.json();
    const { action, params } = requestData;
    
    let result;
    
    // Route the request based on the action
    switch (action) {
      case 'getOrderTimeline':
        result = await getOrderTimeline(supabase, params.orderId);
        break;
      case 'getOrderNotes':
        result = await getOrderNotes(supabase, params.orderId);
        break;
      case 'addOrderTimelineEntry':
        result = await addOrderTimelineEntry(
          supabase, 
          params.orderId, 
          params.status, 
          params.userId, 
          params.note
        );
        break;
      case 'addOrderNote':
        result = await addOrderNote(
          supabase, 
          params.orderId, 
          params.userId, 
          params.note, 
          params.isCustomerVisible
        );
        break;
      case 'deleteOrderNote':
        result = await deleteOrderNote(supabase, params.noteId);
        break;
      case 'bulkAddTimelineEntries':
        result = await bulkAddTimelineEntries(
          supabase, 
          params.orderIds, 
          params.status, 
          params.userId, 
          params.note
        );
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400,
    });
  }
});

// Helper functions
async function getOrderTimeline(supabase, orderId) {
  const { data, error } = await supabase
    .from('order_timeline')
    .select(`
      id,
      order_id,
      status,
      created_at,
      note,
      user_id,
      user:users(first_name, last_name)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return data;
}

async function getOrderNotes(supabase, orderId) {
  const { data, error } = await supabase
    .from('order_notes')
    .select(`
      id,
      order_id,
      note,
      created_at,
      is_customer_visible,
      user_id,
      user:users(first_name, last_name)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

async function addOrderTimelineEntry(supabase, orderId, status, userId, note = null) {
  const { data, error } = await supabase
    .from('order_timeline')
    .insert({
      order_id: orderId,
      status,
      user_id: userId,
      note,
    })
    .select();
    
  if (error) throw error;
  return data;
}

async function addOrderNote(supabase, orderId, userId, note, isCustomerVisible = false) {
  const { data, error } = await supabase
    .from('order_notes')
    .insert({
      order_id: orderId,
      user_id: userId,
      note,
      is_customer_visible: isCustomerVisible,
    })
    .select();
    
  if (error) throw error;
  return data;
}

async function deleteOrderNote(supabase, noteId) {
  const { data, error } = await supabase
    .from('order_notes')
    .delete()
    .eq('id', noteId)
    .select();
    
  if (error) throw error;
  return data;
}

async function bulkAddTimelineEntries(supabase, orderIds, status, userId, note = null) {
  const entries = orderIds.map(orderId => ({
    order_id: orderId,
    status,
    user_id: userId,
    note,
  }));
  
  const { data, error } = await supabase
    .from('order_timeline')
    .insert(entries)
    .select();
    
  if (error) throw error;
  return data;
}
