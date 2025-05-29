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

    // In a real implementation, this would verify the payment with the payment provider
    // For now, we'll simulate a successful payment verification
    const paymentVerified = true;
    const now = new Date().toISOString();

    // Update the transaction with payment verification status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        payment_verified: paymentVerified,
        payment_method: paymentMethod || transaction.payment_method,
        updated_at: now,
      })
      .eq("id", transactionId);

    if (updateError) {
      throw updateError;
    }

    // Create or update payment record
    const { error: paymentError } = await supabase
      .from("payment_records")
      .upsert({
        transaction_id: transactionId,
        payment_method: paymentMethod || transaction.payment_method,
        amount: transaction.price,
        status: paymentVerified ? "completed" : "pending",
        payment_date: paymentVerified ? now : null,
        updated_at: now,
      });

    if (paymentError) {
      throw paymentError;
    }

    // Check if both payment and tickets are verified to complete the transaction
    if (paymentVerified && transaction.tickets_verified) {
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
        verified: paymentVerified,
        transactionId,
        transactionStatus:
          paymentVerified && transaction.tickets_verified
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
