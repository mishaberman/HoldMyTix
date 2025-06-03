import { User } from "@auth0/auth0-react";

// Store the authenticated user in memory
let currentUser: User | null = null;

/**
 * Set the current authenticated user
 */
export const setCurrentUser = (user: User | null) => {
  currentUser = user;

  if (user) {
    document.body.classList.add("user-authenticated");
  } else {
    document.body.classList.remove("user-authenticated");
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
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
  document.body.classList.remove("user-authenticated");
};
