import { User } from "@auth0/auth0-react";

// Store the authenticated user in memory
let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => {
  return currentUser;
};

export const isAuthenticated = () => {
  return currentUser !== null;
};
