
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phoneNumber } = await req.json()
    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpValidUntil = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // For development, we'll just log the OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`)

    // Check if we have a user with this phone number already
    const { data: existingUser, error: lookupError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .maybeSingle()
    
    if (lookupError) {
      console.error('Error looking up user:', lookupError)
      throw lookupError
    }

    if (existingUser) {
      // Update existing user's OTP
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          otp_secret: otp,
          otp_valid_until: otpValidUntil.toISOString(),
          phone_verified: false
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        throw updateError
      }
    } else {
      // For new users, we'll create a temporary entry in a phone_verification table
      // First check if the table exists, and create it if not
      try {
        const { data: tempUser, error: tempUserError } = await supabaseClient
          .from('phone_verification')
          .upsert({
            phone_number: phoneNumber,
            otp_secret: otp,
            otp_valid_until: otpValidUntil.toISOString(),
          }, { onConflict: 'phone_number' })
          .select()
        
        if (tempUserError) {
          console.error('Error creating temporary user:', tempUserError)
          throw tempUserError
        }
      } catch (error) {
        console.error('Error with phone verification table, creating it:', error)
        // This is likely because the table doesn't exist yet
        const { error: createTableError } = await supabaseClient.rpc('create_phone_verification_table')
        if (createTableError) {
          console.error('Error creating phone_verification table:', createTableError)
          throw createTableError
        }
        
        // Try the upsert again
        const { error: retryError } = await supabaseClient
          .from('phone_verification')
          .upsert({
            phone_number: phoneNumber,
            otp_secret: otp,
            otp_valid_until: otpValidUntil.toISOString(),
          }, { onConflict: 'phone_number' })
        
        if (retryError) {
          console.error('Error creating temporary user on retry:', retryError)
          throw retryError
        }
      }
    }

    // In production, you would integrate with an SMS service here
    // await sendSMS(phoneNumber, `Your verification code is: ${otp}`)

    return new Response(
      JSON.stringify({ 
        message: 'OTP sent successfully',
        dev_otp: otp // Only for development, remove in production
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-otp function:', error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
