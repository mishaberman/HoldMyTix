import { User } from "@auth0/auth0-react";

// Store the authenticated user in memory
let currentUser: User | null = null;

// Store the last authentication check time
let lastAuthCheck: number = 0;

// Constants
const AUTH_STORAGE_KEY = "holdmytix_auth";
const AUTH_EXPIRY_HOURS = 24;

/**
 * Set the current authenticated user
 */
export const setCurrentUser = (user: User | null) => {
  currentUser = user;

  if (user) {
    // Store in localStorage with timestamp for persistence
    const authData = {
      sub: user.sub,
      name: user.name,
      email: user.email,
      picture: user.picture,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    document.body.classList.add("user-authenticated");
  } else {
    // Clear stored auth data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.body.classList.remove("user-authenticated");
  }

  // Update last check time
  lastAuthCheck = Date.now();
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  // If we have a user in memory and checked recently, return it
  if (currentUser && Date.now() - lastAuthCheck < 60000) {
    return currentUser;
  }

  // Otherwise check localStorage
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) return null;

    const authData = JSON.parse(storedAuth);
    const authAge = (Date.now() - authData.timestamp) / (1000 * 60 * 60);

    // If auth data is expired, clear it
    if (authAge > AUTH_EXPIRY_HOURS) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.body.classList.remove("user-authenticated");
      return null;
    }

    // Auth data is valid - ensure it has the required User properties
    const validUser: User = {
      ...authData,
      // Ensure required User properties exist
      sub: authData.sub || "",
      name: authData.name || "",
      email: authData.email || "",
      picture: authData.picture || "",
    };

    currentUser = validUser;
    lastAuthCheck = Date.now();
    document.body.classList.add("user-authenticated");
    return currentUser;
  } catch (error) {
    console.error("Error retrieving authentication data:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.body.classList.remove("user-authenticated");
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Clear current user and authentication data
 */
export const clearCurrentUser = (): void => {
  currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.body.classList.remove("user-authenticated");
};
