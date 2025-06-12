
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      transferRequestDate, 
      eventName, 
      eventDate, 
      seatInfo, 
      totalPrice,
      buyerEmail,
      sellerEmail,
      transferId
    } = await req.json()

    const docusignApiKey = "19f46af0-cedf-4b3b-83fd-c575c4eba749"
    const templateId = "93c9fcab-3bf5-441c-a131-642ef320f0c3"
    
    // DocuSign API endpoint (sandbox)
    const docusignBaseUrl = "https://demo.docusign.net/restapi"
    
    // Create envelope with template
    const envelopeData = {
      templateId: templateId,
      templateRoles: [
        {
          email: buyerEmail,
          name: "Buyer",
          roleName: "Buyer",
          tabs: {
            textTabs: [
              {
                tabLabel: "transferRequestDate",
                value: transferRequestDate
              },
              {
                tabLabel: "eventName",
                value: eventName
              },
              {
                tabLabel: "eventDate",
                value: eventDate
              },
              {
                tabLabel: "seatInfo",
                value: seatInfo
              },
              {
                tabLabel: "totalPrice",
                value: totalPrice
              }
            ]
          }
        },
        {
          email: sellerEmail,
          name: "Seller",
          roleName: "Seller",
          tabs: {
            textTabs: [
              {
                tabLabel: "transferRequestDate",
                value: transferRequestDate
              },
              {
                tabLabel: "eventName",
                value: eventName
              },
              {
                tabLabel: "eventDate",
                value: eventDate
              },
              {
                tabLabel: "seatInfo",
                value: seatInfo
              },
              {
                tabLabel: "totalPrice",
                value: totalPrice
              }
            ]
          }
        },
        {
          email: "mishaberman@gmail.com",
          name: "HoldMyTix",
          roleName: "HoldMyTix",
          tabs: {
            textTabs: [
              {
                tabLabel: "transferRequestDate",
                value: transferRequestDate
              },
              {
                tabLabel: "eventName",
                value: eventName
              },
              {
                tabLabel: "eventDate",
                value: eventDate
              },
              {
                tabLabel: "seatInfo",
                value: seatInfo
              },
              {
                tabLabel: "totalPrice",
                value: totalPrice
              }
            ]
          }
        }
      ],
      status: "sent"
    }

    const response = await fetch(`${docusignBaseUrl}/v2.1/accounts/me/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${docusignApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`DocuSign API error: ${result.message || 'Unknown error'}`)
    }

    // Store DocuSign log in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    await supabase
      .from('docusign_logs')
      .insert({
        transaction_id: transferId,
        envelope_id: result.envelopeId,
        status: 'sent',
        document_url: result.uri || null,
        seller_status: 'sent',
        buyer_status: 'sent'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        envelopeId: result.envelopeId,
        message: 'DocuSign envelope sent successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send DocuSign envelope' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
