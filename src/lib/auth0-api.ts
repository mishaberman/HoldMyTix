import { ManagementClient } from "auth0";

const domain = import.meta.env.VITE_AUTH0_DOMAIN || "mishaberman.auth0.com";
const clientId =
  import.meta.env.VITE_AUTH0_CLIENT_ID || "T17DIzlALEvcYGtuUPQOQnZrTH9fFYcd";

// Note: In production, you would need a server-side endpoint to handle this
// as the Management API requires a client secret which should not be exposed
interface CreateUserData {
  email: string;
  password: string;
  name: string;
  connection?: string;
}

interface SignInData {
  email: string;
  password: string;
  connection?: string;
}

// Mock implementation for client-side - in production this would be server-side
export const createAuth0User = async (userData: CreateUserData) => {
  try {
    // This is a mock implementation since we can't use Management API client-side
    // In production, this would be a server endpoint that creates the user
    const response = await fetch(`https://${domain}/dbconnections/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        connection: userData.connection || "Username-Password-Authentication",
        email: userData.email,
        password: userData.password,
        name: userData.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || "Failed to create user");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating Auth0 user:", error);
    return {
      success: false,
      error: error.message || "Failed to create user",
    };
  }
};

export const signInAuth0User = async (signInData: SignInData) => {
  try {
    // Use Auth0's Resource Owner Password Grant
    const response = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "password",
        username: signInData.email,
        password: signInData.password,
        client_id: clientId,
        connection: signInData.connection || "Username-Password-Authentication",
        scope: "openid profile email",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || "Failed to sign in");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error signing in Auth0 user:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in",
    };
  }
};
