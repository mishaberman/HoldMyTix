import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Initialize storage bucket for user avatars
export const initStorage = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "user-avatars",
    );

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket("user-avatars", {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
      });

      if (error) {
        console.error("Error creating storage bucket:", error);
      } else {
        console.log("Created user-avatars storage bucket");
      }
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

/**
 * Sync Auth0 user with Supabase database
 */
export const syncUserWithSupabase = async (auth0User: any) => {
  if (!auth0User?.sub) {
    console.error("No user ID found in Auth0 user object");
    return null;
  }

  try {
    // Initialize storage for user avatars
    await initStorage();

    // Extract Auth0 user ID from the sub claim
    const userId = auth0User.sub;

    // First try using the RPC function
    const { data: user, error: rpcError } = await supabase.rpc(
      "create_user_if_not_exists",
      {
        user_id: userId,
        user_email: auth0User.email,
        user_name: auth0User.name || "User",
        user_avatar: auth0User.picture || null,
      },
    );

    if (!rpcError && user) {
      console.log("Successfully synced user with Supabase via RPC", user);
      return user;
    }

    if (rpcError) {
      console.warn(
        "RPC error, falling back to direct queries:",
        rpcError.message,
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user from Supabase:", fetchError);
    }

    if (existingUser) {
      // User exists, update their information
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          email: auth0User.email,
          full_name: auth0User.name || existingUser.full_name || "User",
          avatar_url: auth0User.picture || existingUser.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user in Supabase:", updateError);
        return existingUser; // Return existing user data if update fails
      }

      console.log("Successfully updated user in Supabase", updatedUser);
      return updatedUser;
    } else {
      // User doesn't exist, create a new user
      const userData = {
        id: userId,
        email: auth0User.email,
        full_name: auth0User.name || "User",
        avatar_url: auth0User.picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user in Supabase:", insertError);
        return null;
      }

      console.log("Successfully created new user in Supabase", newUser);
      return newUser;
    }
  } catch (error) {
    console.error("Error syncing user with Supabase:", error);
    return null;
  }
};

/**
 * Update user profile in Supabase
 */
export const updateUserProfile = async (
  userId: string,
  updates: { full_name?: string; avatar_url?: string },
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return null;
  }
};

/**
 * Get user profile from Supabase
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
};
