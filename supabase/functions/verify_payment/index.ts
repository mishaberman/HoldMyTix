// This edge function handles payment verification
// It would integrate with payment providers in a real implementation

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
    const { transactionId, paymentMethod } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // In a real implementation, this would verify the payment with the payment provider
    // For now, we'll simulate a successful payment verification
    const paymentVerified = true;
    const now = new Date().toISOString();

    // Update the transaction with payment verification status
    const { error: updateError } = await supabase
      .from("ticket_transfers")
      .update({
        payment_verified: paymentVerified,
        payment_method: paymentMethod || transaction.payment_method,
        updated_at: now,
      })
      .eq("id", transactionId);

    if (updateError) {
      throw updateError;
    }

    // Check if both payment and tickets are verified to complete the transaction
    if (paymentVerified && transaction.tickets_verified) {
      const { error: completeError } = await supabase
        .from("ticket_transfers")
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
        payment_verified: paymentVerified,
        transaction_status: paymentVerified && transaction.tickets_verified ? "completed" : "pending",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});