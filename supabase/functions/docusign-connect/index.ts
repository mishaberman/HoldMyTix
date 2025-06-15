import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DocuSignConnectData {
  EnvelopeStatus: {
    EnvelopeID: string
    Status: string
    Created: string
    Completed?: string
    StatusChangedDateTime: string
    RecipientStatuses?: {
      RecipientStatus: Array<{
        Type: string
        Email: string
        UserName: string
        Status: string
        Signed?: string
        Delivered?: string
        DeclineReason?: string
      }>
    }
    CustomFields?: {
      CustomField: Array<{
        Name: string
        Value: string
      }>
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the DocuSign Connect XML data
    const body = await req.text()
    console.log('DocuSign Connect webhook received:', body)

    // DocuSign sends XML, but we'll also handle JSON for testing
    let connectData: DocuSignConnectData
    
    if (body.startsWith('<?xml') || body.startsWith('<')) {
      // Parse XML to JSON (simplified - in production you'd use a proper XML parser)
      // For now, we'll expect JSON format for testing
      throw new Error('XML parsing not implemented - please send JSON for testing')
    } else {
      connectData = JSON.parse(body)
    }

    const envelopeStatus = connectData.EnvelopeStatus
    const envelopeId = envelopeStatus.EnvelopeID
    const status = envelopeStatus.Status
    const statusChangedDateTime = envelopeStatus.StatusChangedDateTime

    console.log(`Processing envelope ${envelopeId} with status ${status}`)

    // Find the transfer associated with this envelope
    const { data: agreement, error: agreementError } = await supabase
      .from('docusign_agreements')
      .select('*, ticket_transfers(*)')
      .eq('envelope_id', envelopeId)
      .single()

    if (agreementError || !agreement) {
      console.error('Agreement not found for envelope:', envelopeId, agreementError)
      return new Response('Agreement not found', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Update the agreement status
    const updateData: any = {
      status: status.toLowerCase(),
      updated_at: new Date().toISOString()
    }

    if (envelopeStatus.Completed) {
      updateData.completed_at = envelopeStatus.Completed
    }

    // Process recipient statuses
    if (envelopeStatus.RecipientStatuses?.RecipientStatus) {
      const recipients = Array.isArray(envelopeStatus.RecipientStatuses.RecipientStatus) 
        ? envelopeStatus.RecipientStatuses.RecipientStatus
        : [envelopeStatus.RecipientStatuses.RecipientStatus]

      for (const recipient of recipients) {
        const email = recipient.Email.toLowerCase()
        const recipientStatus = recipient.Status.toLowerCase()
        
        // Match recipient to seller or buyer based on email
        const transfer = agreement.ticket_transfers
        if (transfer) {
          if (email === transfer.seller_email?.toLowerCase()) {
            updateData.seller_status = recipientStatus
            if (recipient.Signed) {
              updateData.seller_signed_at = recipient.Signed
            }
          } else if (email === transfer.buyer_email?.toLowerCase()) {
            updateData.buyer_status = recipientStatus
            if (recipient.Signed) {
              updateData.buyer_signed_at = recipient.Signed
            }
          }
        }
      }
    }

    // Update the DocuSign agreement
    const { error: updateError } = await supabase
      .from('docusign_agreements')
      .update(updateData)
      .eq('envelope_id', envelopeId)

    if (updateError) {
      console.error('Error updating agreement:', updateError)
      throw updateError
    }

    // Check if all parties have signed and update transfer status
    if (status.toLowerCase() === 'completed') {
      const { error: transferUpdateError } = await supabase
        .from('ticket_transfers')
        .update({
          docusign_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', agreement.transaction_id)

      if (transferUpdateError) {
        console.error('Error updating transfer:', transferUpdateError)
      }
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from('docusign_webhook_logs')
      .insert({
        envelope_id: envelopeId,
        status: status,
        raw_data: body,
        processed_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('Error logging webhook event:', logError)
    }

    console.log(`Successfully processed DocuSign webhook for envelope ${envelopeId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        envelopeId,
        status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing DocuSign webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})