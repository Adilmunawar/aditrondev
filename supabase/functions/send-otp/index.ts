import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
// Generate a random 6-digit code added by adil
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Normalize phone number to a consistent format comments by adil munawar
const normalizePhoneNumber = (phoneNumber: string) => {
  // Remove all non-digit characters except the leading +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure number starts with '+'
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
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

    const requestData = await req.json();
    const { phoneNumber } = requestData;

    console.log("Received request data:", requestData);

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log(`Processing OTP request for: ${normalizedPhoneNumber}`);

    // First, ensure the phone_verification table exists by calling our function
    try {
      const { error: createTableError } = await supabase.rpc('create_phone_verification_table');
      
      if (createTableError) {
        console.error("Error creating phone verification table:", createTableError);
        // Continue anyway as the table might already exist
      } else {
        console.log("Phone verification table created or confirmed");
      }
    } catch (tableError) {
      console.error("Error calling create_phone_verification_table function:", tableError);
      // Continue anyway as the table might already exist
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store the OTP in the database
    try {
      const { error: insertError } = await supabase
        .from('phone_verification')
        .upsert([
          {
            phone_number: normalizedPhoneNumber,
            otp: otp,
            expires_at: expiresAt.toISOString(),
            verified: false
          }
        ], { onConflict: 'phone_number' });

      if (insertError) {
        console.error("Error storing OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create verification code", details: insertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // In production, you would send the OTP via SMS here
      // For development, we'll return the OTP in the response
      console.log(`OTP for ${normalizedPhoneNumber}: ${otp}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          dev_otp: otp, // Remove this in production
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return new Response(
        JSON.stringify({ error: "Database operation failed", details: dbError.message }),
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
