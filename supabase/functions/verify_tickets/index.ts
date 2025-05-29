// This edge function handles ticket verification
// It would integrate with ticket providers in a real implementation

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
    // Parse request body
    const { transactionId, provider, verificationCode } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // In a real implementation, this would verify the tickets with the ticket provider
    // For now, we'll simulate a successful ticket verification
    const ticketsVerified = true;
    const now = new Date().toISOString();

    // Update the transaction with ticket verification status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        tickets_verified: ticketsVerified,
        updated_at: now,
      })
      .eq("id", transactionId);

    if (updateError) {
      throw updateError;
    }

    // Create or update ticket transfer record
    const { error: transferError } = await supabase
      .from("ticket_transfers")
      .upsert({
        transaction_id: transactionId,
        provider: provider || "Unknown",
        transfer_status: ticketsVerified ? "completed" : "pending",
        verification_code: verificationCode || null,
        transfer_date: ticketsVerified ? now : null,
        updated_at: now,
      });

    if (transferError) {
      throw transferError;
    }

    // Check if both payment and tickets are verified to complete the transaction
    if (ticketsVerified && transaction.payment_verified) {
      const { error: completeError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          updated_at: now,
        })
        .eq("id", transactionId);

      if (completeError) {
        throw completeError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: ticketsVerified,
        transactionId,
        transactionStatus:
          ticketsVerified && transaction.payment_verified
            ? "completed"
            : transaction.status,
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
