
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      throw new Error('Server configuration error');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    console.log(`Processing OTP request for: ${phoneNumber}`);

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpValidUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in a safer way - directly use profiles table if possible
    // First check if user exists with this phone number
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profiles:', profileError);
    }

    if (existingProfile?.id) {
      // Update the existing profile with new OTP
      console.log(`Updating OTP for existing user: ${existingProfile.id}`);
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          otp_secret: otp,
          otp_valid_until: otpValidUntil.toISOString(),
          phone_verified: false
        })
        .eq('id', existingProfile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Failed to update profile');
      }
    } else {
      // Use a temporary table for non-registered users
      // First ensure the phone_verification table exists
      try {
        // Try to create the table if it doesn't exist
        await supabaseAdmin.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.phone_verification (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              phone_number TEXT UNIQUE NOT NULL,
              otp_secret TEXT NOT NULL,
              otp_valid_until TIMESTAMPTZ NOT NULL,
              created_at TIMESTAMPTZ DEFAULT now()
            );
          `
        });
        
        // Insert or update the phone verification record
        const { error: upsertError } = await supabaseAdmin
          .from('phone_verification')
          .upsert({
            phone_number: phoneNumber,
            otp_secret: otp,
            otp_valid_until: otpValidUntil.toISOString(),
          }, { onConflict: 'phone_number' });
          
        if (upsertError) {
          console.error('Error upserting verification record:', upsertError);
          throw new Error('Failed to create verification record');
        }
      } catch (error) {
        console.error('Error with verification table:', error);
        throw new Error('Database operation failed');
      }
    }

    console.log(`OTP generated successfully for ${phoneNumber}: ${otp}`);
    
    // In production, integrate with Twilio or other SMS provider here
    // For development, just return the OTP
    return new Response(
      JSON.stringify({ 
        message: 'OTP sent successfully',
        dev_otp: otp // Only include in development
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
