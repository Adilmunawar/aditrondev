
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

    // First check if the phone_verification table exists
    try {
      // Check if the phone_verification table exists
      const { error: checkError } = await supabase
        .from('phone_verification')
        .select('id')
        .limit(1);
      
      if (checkError) {
        console.error("Phone verification table doesn't exist:", checkError);
        return new Response(
          JSON.stringify({ error: "Verification system not set up properly" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } catch (tableError) {
      console.error("Error checking table:", tableError);
      return new Response(
        JSON.stringify({ error: "Failed to access verification system" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if OTP is valid
    try {
      const { data: verificationData, error: verificationError } = await supabase
        .from('phone_verification')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (verificationError) {
        console.error("Error verifying OTP:", verificationError);
        return new Response(
          JSON.stringify({ error: "Verification check failed" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (!verificationData) {
        console.log("Invalid or expired OTP");
        return new Response(
          JSON.stringify({ error: "Invalid or expired verification code" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from('phone_verification')
        .update({ verified: true })
        .eq('phone_number', phoneNumber);

      if (updateError) {
        console.error("Error updating verification status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to complete verification" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Check if user exists
      let userId;
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (userError) {
        console.error("Error checking for existing user:", userError);
        return new Response(
          JSON.stringify({ error: "Failed to verify user identity" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // If user exists, get their ID, otherwise create a new user
      if (existingUser) {
        userId = existingUser.id;
        console.log(`Existing user found: ${userId}`);
      } else {
        // Create a new user
        try {
          const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
            phone: phoneNumber,
            phone_confirm: true,
            user_metadata: { phone_verified: true }
          });

          if (createError || !authUser?.user) {
            console.error("Error creating user:", createError);
            return new Response(
              JSON.stringify({ error: "Failed to create user account" }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          userId = authUser.user.id;
          console.log(`New user created: ${userId}`);

          // Create profile for new user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId, 
              phone_number: phoneNumber,
              phone_verified: true
            }]);

          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Continue anyway as the auth user was created
          }
        } catch (createUserError) {
          console.error("User creation error:", createUserError);
          return new Response(
            JSON.stringify({ error: "Failed to create user account", details: createUserError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }

      // Create a session for the user
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
          user_id: userId
        });

        if (sessionError) {
          console.error("Error creating session:", sessionError);
          return new Response(
            JSON.stringify({ error: "Failed to create login session" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            session: sessionData,
            message: "Phone number verified successfully" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (sessionError) {
        console.error("Session creation error:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create login session", details: sessionError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } catch (otpError) {
      console.error("OTP verification error:", otpError);
      return new Response(
        JSON.stringify({ error: "Verification process failed", details: otpError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
