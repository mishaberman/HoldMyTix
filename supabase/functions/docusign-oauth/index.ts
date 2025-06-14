/*
# DocuSign OAuth Handler

This edge function handles DocuSign OAuth flow:
1. Exchange authorization code for access token
2. Store tokens in Supabase
3. Refresh tokens when needed
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DocuSignTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface DocuSignUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  accounts: Array<{
    account_id: string;
    is_default: boolean;
    account_name: string;
    base_uri: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (action === 'callback') {
      return await handleOAuthCallback(req);
    } else if (action === 'refresh') {
      return await handleTokenRefresh(req);
    } else if (action === 'get-token') {
      return await getValidToken(req);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('DocuSign OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleOAuthCallback(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const userId = url.searchParams.get('user_id');

  if (!code) {
    throw new Error('Authorization code not provided');
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa('297ca827-212d-437f-8f42-76de497ed99f:19f46af0-cedf-4b3b-83fd-c575c4eba749')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokens: DocuSignTokenResponse = await tokenResponse.json();

  // Get user info to get account details
  const userInfoResponse = await fetch('https://account-d.docusign.com/oauth/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error('Failed to get user info');
  }

  const userInfo: DocuSignUserInfo = await userInfoResponse.json();
  const defaultAccount = userInfo.accounts.find(acc => acc.is_default) || userInfo.accounts[0];

  if (!defaultAccount) {
    throw new Error('No DocuSign account found');
  }

  // Store tokens in Supabase
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error } = await supabase
    .from('docusign_tokens')
    .upsert({
      user_id: userInfo.sub,
      account_id: defaultAccount.account_id,
      base_uri: defaultAccount.base_uri,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store tokens');
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'DocuSign OAuth completed successfully',
      account_id: defaultAccount.account_id,
      base_uri: defaultAccount.base_uri
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleTokenRefresh(req: Request) {
  const { user_id } = await req.json();

  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get current tokens
  const { data: tokenData, error: fetchError } = await supabase
    .from('docusign_tokens')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (fetchError || !tokenData) {
    throw new Error('No tokens found for user');
  }

  // Refresh the token
  const refreshResponse = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa('297ca827-212d-437f-8f42-76de497ed99f:19f46af0-cedf-4b3b-83fd-c575c4eba749')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
    }),
  });

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  const newTokens: DocuSignTokenResponse = await refreshResponse.json();
  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

  // Update tokens in database
  const { error: updateError } = await supabase
    .from('docusign_tokens')
    .update({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || tokenData.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user_id);

  if (updateError) {
    throw new Error('Failed to update tokens');
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      access_token: newTokens.access_token,
      account_id: tokenData.account_id,
      base_uri: tokenData.base_uri
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function getValidToken(req: Request) {
  const { user_id } = await req.json();

  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: tokenData, error } = await supabase
    .from('docusign_tokens')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error || !tokenData) {
    throw new Error('No tokens found for user');
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (expiresAt.getTime() <= now.getTime() + bufferTime) {
    // Token is expired or about to expire, refresh it
    return await handleTokenRefresh(new Request(req.url, {
      method: 'POST',
      body: JSON.stringify({ user_id }),
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      access_token: tokenData.access_token,
      account_id: tokenData.account_id,
      base_uri: tokenData.base_uri
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}