
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

    // First check if the table exists
    try {
      // Check if the phone_verification table exists
      const { data: tableExists, error: checkError } = await supabase
        .from('phone_verification')
        .select('id')
        .limit(1);
      
      if (checkError) {
        // Table probably doesn't exist, try to create it
        console.log("Table check failed, attempting to create phone_verification table");
        
        // Use SQL query to create the table directly
        const { error: createTableError } = await supabase.rpc('create_phone_verification_table');
        
        if (createTableError) {
          console.error("Failed to create phone verification table via RPC:", createTableError);
          
          // Try direct SQL query as fallback
          const { error: directCreateError } = await supabase
            .from('phone_verification')
            .insert([{ 
              phone_number: 'test', 
              otp: 'test', 
              expires_at: new Date().toISOString(),
              verified: false 
            }])
            .select();
          
          if (directCreateError && directCreateError.code !== '23505') {
            console.error("Direct table check failed:", directCreateError);
            
            // As a last resort, try to execute raw SQL
            try {
              await supabase.query(`
                CREATE TABLE IF NOT EXISTS public.phone_verification (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  phone_number TEXT NOT NULL,
                  otp TEXT NOT NULL,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                  verified BOOLEAN DEFAULT FALSE,
                  UNIQUE(phone_number)
                );
              `);
              console.log("Created phone_verification table via raw SQL");
            } catch (sqlError) {
              console.error("Raw SQL table creation failed:", sqlError);
              throw new Error("Could not create phone verification table");
            }
          }
        } else {
          console.log("Created phone_verification table via RPC");
        }
      } else {
        console.log("Phone verification table exists");
      }
    } catch (tableError) {
      console.error("Error checking/creating table:", tableError);
      return new Response(
        JSON.stringify({ error: "Failed to setup verification system" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
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
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return new Response(
        JSON.stringify({ error: "Database operation failed" }),
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
