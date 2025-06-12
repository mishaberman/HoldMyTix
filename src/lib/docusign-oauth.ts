export const initiateDocuSignAuth = () => {
  const clientId = "297ca827-212d-437f-8f42-76de497ed99f";
  // Redirect directly to your Supabase edge function
  const redirectUri =
    "https://angry-ardinghelli9-se6rs.view.tempo-dev.app/supabase-functions-docusign_callback";
  const scope = "signature";

  const authUrl = new URL("https://account-d.docusign.com/oauth/auth");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);

  window.location.href = authUrl.toString();
};

export const checkDocuSignAuth = async (): Promise<boolean> => {
  try {
    // You can add a function to check if valid tokens exist
    // For now, return true - you might want to implement a proper check
    return true;
  } catch (error) {
    console.error("Error checking DocuSign auth:", error);
    return false;
  }
};
