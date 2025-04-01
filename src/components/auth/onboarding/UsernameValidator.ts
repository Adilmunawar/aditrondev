
import { supabase } from "@/integrations/supabase/client";

export const checkUsernameAvailability = async (
  usernameToCheck: string, 
  userId: string, 
  initialDataLoaded: boolean
): Promise<{ isValid: boolean; error: string | null }> => {
  if (!initialDataLoaded) return { isValid: true, error: null };
  
  if (!usernameToCheck.trim()) {
    return { isValid: false, error: "Username is required" };
  }
  
  // Get current user to exempt them from username check (for update case)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { isValid: false, error: null };
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", usernameToCheck)
    .neq("id", userId) // Don't count current user's username as a duplicate
    .maybeSingle();
  
  if (data) {
    return { isValid: false, error: "This username is already taken" };
  } else {
    return { isValid: true, error: null };
  }
};
