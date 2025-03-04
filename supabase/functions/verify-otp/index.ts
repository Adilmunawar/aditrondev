
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Verifying OTP for: ${phoneNumber}`);

    // First check if the record exists
    const { data: verification, error: selectError } = await supabase
      .from('phone_verification')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (selectError || !verification) {
      console.error("Error retrieving verification record:", selectError);
      return new Response(
        JSON.stringify({ error: "Verification record not found. Please request a new OTP." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date(verification.expires_at) < new Date()) {
      console.log("OTP has expired");
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if OTP matches
    if (verification.otp !== otp) {
      console.log("Invalid OTP provided");
      return new Response(
        JSON.stringify({ error: "Invalid verification code. Please try again." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Mark the OTP as verified
    const { error: updateError } = await supabase
      .from('phone_verification')
      .update({ verified: true })
      .eq('phone_number', phoneNumber);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to verify phone number" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Look for existing user with this phone number
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single();

    let userId, session;

    if (existingUser) {
      userId = existingUser.id;
      
      // Update existing user
      await supabase
        .from('profiles')
        .update({ 
          phone_verified: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);
        
      // Get or create session for existing user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.getUserById(userId);
      
      if (sessionError || !sessionData.user) {
        console.error("Error getting user:", sessionError);
        // Try to create a session anyway
        const { data: newSession, error: signInError } = await supabase.auth.admin.createSession({
          user_id: userId
        });
        
        if (signInError) {
          console.error("Error creating session:", signInError);
          return new Response(
            JSON.stringify({ error: "Authentication failed" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        session = newSession;
      } else {
        // Create a session for the existing user
        const { data: newSession, error: signInError } = await supabase.auth.admin.createSession({
          user_id: userId
        });
        
        if (signInError) {
          console.error("Error creating session:", signInError);
          return new Response(
            JSON.stringify({ error: "Authentication failed" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        session = newSession;
      }
    } else {
      // Create a new user with this phone number
      const username = `user${Math.floor(Math.random() * 1000000)}`;
      
      // Create auth user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        phone: phoneNumber,
        email: `${username}@example.com`, // placeholder email, not used
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { username }
      });
      
      if (userError || !userData.user) {
        console.error("Error creating user:", userError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      userId = userData.user.id;
      
      // Update the profile directly
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          phone_number: phoneNumber,
          phone_verified: true 
        })
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Continue anyway as the trigger might have created the profile
      }
      
      // Create a session for the new user
      const { data: newSession, error: sessionError } = await supabase.auth.admin.createSession({
        user_id: userId
      });
      
      if (sessionError) {
        console.error("Error creating session:", sessionError);
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      session = newSession;
    }

    console.log(`Successfully verified OTP for: ${phoneNumber}`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Phone number verified successfully",
        session
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
