
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate a random 6-digit code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing OTP request for: ${phoneNumber}`);

    // Create the phone_verification table if it doesn't exist
    try {
      await supabase.rpc('create_phone_verification_table_if_not_exists');
      console.log("Phone verification table exists or was created successfully");
    } catch (tableError) {
      // If the RPC doesn't exist, create the table directly
      try {
        console.log("Attempting to create phone_verification table directly");
        const { error: createTableError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.phone_verification (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            phone_number TEXT NOT NULL,
            otp TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            verified BOOLEAN DEFAULT FALSE
          );
        `);
        
        if (createTableError) throw createTableError;
      } catch (directCreateError) {
        console.error("Failed to create phone verification table:", directCreateError);
        return new Response(
          JSON.stringify({ error: "Internal server error: Could not setup verification" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store the OTP in the database
    const { error: insertError } = await supabase
      .from('phone_verification')
      .upsert([
        {
          phone_number: phoneNumber,
          otp: otp,
          expires_at: expiresAt.toISOString(),
          verified: false
        }
      ], { onConflict: 'phone_number' });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification code" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // In production, you would send the OTP via SMS here
    // For development, we'll return the OTP in the response
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        dev_otp: otp, // Remove this in production
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
