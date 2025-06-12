
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

    // DocuSign JWT configuration
    const docusignClientId = "297ca827-212d-437f-8f42-76de497ed99f"
    const docusignUserId = Deno.env.get('DOCUSIGN_USER_ID') || 'your-user-id'
    const docusignPrivateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY') || ''
    const templateId = "93c9fcab-3bf5-441c-a131-642ef320f0c3"
    
    // DocuSign API endpoint (sandbox)
    const docusignBaseUrl = "https://demo.docusign.net/restapi"
    const docusignAuthUrl = "https://account-d.docusign.com/oauth/token"
    
    // Create JWT token
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: docusignClientId,
      sub: docusignUserId,
      aud: "account-d.docusign.com",
      iat: now,
      exp: now + 3600, // 1 hour expiration
      scope: "signature impersonation"
    }

    // Convert private key from environment variable
    const privateKeyPem = docusignPrivateKey.replace(/\\n/g, '\n')
    const key = await crypto.subtle.importKey(
      "pkcs8",
      new TextEncoder().encode(privateKeyPem),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const jwt = await create({ alg: "RS256", typ: "JWT" }, payload, key)

    // Exchange JWT for access token
    const tokenResponse = await fetch(docusignAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`)
    }

    const accessToken = tokenData.access_token

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
