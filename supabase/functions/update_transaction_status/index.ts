// This edge function runs periodically to update transaction statuses
// It checks for expired transactions and updates their status

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client using service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time
    const now = new Date().toISOString();

    // Find transactions that have expired
    const { data: expiredTransactions, error: fetchError } = await supabase
      .from("transactions")
      .select("id")
      .eq("status", "active")
      .lt("expiration_time", now);

    if (fetchError) {
      throw fetchError;
    }

    // Update expired transactions to 'cancelled' status
    if (expiredTransactions && expiredTransactions.length > 0) {
      const expiredIds = expiredTransactions.map((tx) => tx.id);

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "cancelled", updated_at: now })
        .in("id", expiredIds);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${expiredTransactions?.length || 0} expired transactions`,
        updated: expiredTransactions,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
