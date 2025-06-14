// DocuSign API integration with proper OAuth flow

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface DocuSignEnvelopeData {
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

export const initiateDocuSignOAuth = () => {
  const clientId = '297ca827-212d-437f-8f42-76de497ed99f';
  const redirectUri = encodeURIComponent('https://www.holdmytix.com/docusign-callback');
  const scope = encodeURIComponent('signature');
  
  const authUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=${scope}&client_id=${clientId}&redirect_uri=${redirectUri}`;
  
  window.open(authUrl, '_blank', 'width=600,height=700');
};

export const handleDocuSignCallback = async (code: string, userId: string) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/docusign-oauth?action=callback&code=${code}&user_id=${userId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to complete DocuSign OAuth');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('DocuSign OAuth callback error:', error);
    return { success: false, error: error.message };
  }
};

export const createDocuSignEnvelope = async (envelopeData: DocuSignEnvelopeData) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/docusign-envelope`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelopeData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create DocuSign envelope: ${errorText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('DocuSign envelope creation error:', error);
    return { success: false, error: error.message };
  }
};

export const getDocuSignToken = async (userId: string) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/docusign-oauth?action=get-token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get DocuSign token');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('DocuSign token retrieval error:', error);
    return { success: false, error: error.message };
  }
};