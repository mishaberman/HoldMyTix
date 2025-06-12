
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

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

    // DocuSign configuration
    const templateId = "93c9fcab-3bf5-441c-a131-642ef320f0c3"
    
    // Get stored OAuth tokens from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the most recent DocuSign token (you might want to filter by a specific user)
    const { data: tokenData, error: tokenError } = await supabase
      .from('docusign_tokens')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No DocuSign authentication found. Please authenticate with DocuSign first.')
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()
    
    let accessToken = tokenData.access_token
    let docusignBaseUrl = tokenData.base_uri + "/restapi"

    // If token is expired, refresh it
    if (now >= expiresAt && tokenData.refresh_token) {
      const clientId = Deno.env.get("DOCUSIGN_CLIENT_ID") || "297ca827-212d-437f-8f42-76de497ed99f"
      const clientSecret = Deno.env.get("DOCUSIGN_CLIENT_SECRET")
      
      if (!clientSecret) {
        throw new Error("DOCUSIGN_CLIENT_SECRET is required for token refresh")
      }

      const refreshResponse = await fetch("https://account-d.docusign.com/oauth/token", {
        method: 'POST',
        headers: {
          "Authorization": "Basic " + btoa(`${clientId}:${clientSecret}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token
        })
      })

      const refreshData = await refreshResponse.json()
      
      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshData.error_description || refreshData.error}`)
      }

      accessToken = refreshData.access_token

      // Update stored tokens
      await supabase
        .from('docusign_tokens')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token || tokenData.refresh_token,
          expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenData.id)
    }

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
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`DocuSign API error: ${result.message || 'Unknown error'}`)
    }

    // Store DocuSign log in Supabase (client already created above)

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
