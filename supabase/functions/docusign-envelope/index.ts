/*
# DocuSign Envelope Creation

This edge function creates and sends DocuSign envelopes for ticket transfers.
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EnvelopeRequest {
  transferRequestDate: string;
  eventName: string;
  eventDate: string;
  seatInfo: string;
  totalPrice: number;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  transferId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const envelopeData: EnvelopeRequest = await req.json();

    // Get valid DocuSign token (using admin user for now)
    const tokenResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-oauth?action=get-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ user_id: 'admin' }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get DocuSign token');
    }

    const tokenData = await tokenResponse.json();

    // Create envelope using template
    const envelope = {
      templateId: '93c9fcab-3bf5-441c-a131-642ef320f0c3',
      templateRoles: [
        {
          roleName: 'Seller',
          name: envelopeData.sellerName,
          email: envelopeData.sellerEmail,
          tabs: {
            textTabs: [
              {
                tabLabel: 'transferRequestDate',
                value: envelopeData.transferRequestDate,
              },
              {
                tabLabel: 'eventName',
                value: envelopeData.eventName,
              },
              {
                tabLabel: 'eventDate',
                value: envelopeData.eventDate,
              },
              {
                tabLabel: 'seatInfo',
                value: envelopeData.seatInfo,
              },
              {
                tabLabel: 'totalPrice',
                value: envelopeData.totalPrice.toString(),
              },
            ],
          },
        },
        {
          roleName: 'Buyer',
          name: envelopeData.buyerName,
          email: envelopeData.buyerEmail,
          tabs: {
            textTabs: [
              {
                tabLabel: 'transferRequestDate',
                value: envelopeData.transferRequestDate,
              },
              {
                tabLabel: 'eventName',
                value: envelopeData.eventName,
              },
              {
                tabLabel: 'eventDate',
                value: envelopeData.eventDate,
              },
              {
                tabLabel: 'seatInfo',
                value: envelopeData.seatInfo,
              },
              {
                tabLabel: 'totalPrice',
                value: envelopeData.totalPrice.toString(),
              },
            ],
          },
        },
        {
          roleName: 'HoldMyTix',
          name: 'HoldMyTix Admin',
          email: 'info@holdmytix.com',
          tabs: {
            textTabs: [
              {
                tabLabel: 'transferRequestDate',
                value: envelopeData.transferRequestDate,
              },
              {
                tabLabel: 'eventName',
                value: envelopeData.eventName,
              },
              {
                tabLabel: 'eventDate',
                value: envelopeData.eventDate,
              },
              {
                tabLabel: 'seatInfo',
                value: envelopeData.seatInfo,
              },
              {
                tabLabel: 'totalPrice',
                value: envelopeData.totalPrice.toString(),
              },
            ],
          },
        },
      ],
      status: 'sent',
    };

    // Send envelope
    const envelopeResponse = await fetch(
      `${tokenData.base_uri}/restapi/v2.1/accounts/${tokenData.account_id}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelope),
      }
    );

    if (!envelopeResponse.ok) {
      const errorText = await envelopeResponse.text();
      console.error('Envelope creation failed:', errorText);
      throw new Error(`Envelope creation failed: ${errorText}`);
    }

    const envelopeResult = await envelopeResponse.json();

    // Store envelope info in database
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('docusign_agreements')
      .insert({
        transaction_id: envelopeData.transferId,
        envelope_id: envelopeResult.envelopeId,
        status: 'sent',
        seller_status: 'sent',
        buyer_status: 'sent',
      });

    if (error) {
      console.error('Failed to store envelope info:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId: envelopeResult.envelopeId,
        status: envelopeResult.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DocuSign envelope error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});