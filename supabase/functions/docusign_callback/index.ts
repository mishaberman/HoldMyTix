import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const authCode = url.searchParams.get("code");

    if (!authCode) {
      throw new Error("No authorization code provided");
    }

    const clientId =
      Deno.env.get("DOCUSIGN_CLIENT_ID") ||
      "297ca827-212d-437f-8f42-76de497ed99f";
    const clientSecret = Deno.env.get("DOCUSIGN_CLIENT_SECRET");
    const redirectUri =
      "https://angry-ardinghelli9-se6rs.view.tempo-dev.app/supabase-functions-docusign_callback";

    if (!clientSecret) {
      throw new Error(
        "DOCUSIGN_CLIENT_SECRET environment variable is required",
      );
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch("https://account-d.docusign.com/oauth/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(
        `Token exchange failed: ${tokenData.error_description || tokenData.error}`,
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Get user info to identify the DocuSign account
    const userInfoRes = await fetch(
      "https://account-d.docusign.com/oauth/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const userInfo = await userInfoRes.json();

    if (!userInfoRes.ok) {
      throw new Error(
        `Failed to get user info: ${userInfo.error_description || userInfo.error}`,
      );
    }

    // Store tokens securely in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Store DocuSign tokens (you may want to create a separate table for this)
    await supabase.from("docusign_tokens").upsert(
      {
        user_id: userInfo.sub,
        account_id: userInfo.accounts[0]?.account_id,
        base_uri: userInfo.accounts[0]?.base_uri,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    // Redirect back to frontend with success message
    const frontendUrl =
      "https://angry-ardinghelli9-se6rs.view.tempo-dev.app/dashboard?docusign=success";

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>DocuSign Authentication Successful</title>
          <script>
            window.location.href = "${frontendUrl}";
          </script>
        </head>
        <body>
          <p>DocuSign authentication successful! Redirecting...</p>
        </body>
      </html>`,
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      },
    );
  } catch (error) {
    console.error("DocuSign callback error:", error);

    // Redirect back to frontend with error message
    const frontendUrl = `https://angry-ardinghelli9-se6rs.view.tempo-dev.app/dashboard?docusign=error&message=${encodeURIComponent(error.message || "Failed to process DocuSign callback")}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>DocuSign Authentication Error</title>
          <script>
            window.location.href = "${frontendUrl}";
          </script>
        </head>
        <body>
          <p>DocuSign authentication failed. Redirecting...</p>
        </body>
      </html>`,
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      },
    );
  }
});
