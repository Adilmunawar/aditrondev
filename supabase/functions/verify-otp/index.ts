
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

    const { phoneNumber, otp } = await req.json()
    
    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }
    
    if (!otp) {
      throw new Error('OTP is required')
    }

    // Check if we have a user with this phone number already
    const { data: existingUser, error: lookupError } = await supabaseClient
      .from('profiles')
      .select('id, otp_secret, otp_valid_until')
      .eq('phone_number', phoneNumber)
      .maybeSingle()
    
    let userId = null
    let isVerified = false

    if (existingUser) {
      // Verify OTP for existing user
      if (existingUser.otp_secret === otp && new Date(existingUser.otp_valid_until) > new Date()) {
        // Update user as verified
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            phone_verified: true,
            otp_secret: null,
            otp_valid_until: null
          })
          .eq('id', existingUser.id)
          .eq('phone_number', phoneNumber)

        if (updateError) throw updateError
        
        userId = existingUser.id
        isVerified = true
      } else {
        throw new Error('Invalid or expired OTP')
      }
    } else {
      // Check in the temporary phone_verification table
      const { data: tempUser, error: tempLookupError } = await supabaseClient
        .from('phone_verification')
        .select('otp_secret, otp_valid_until')
        .eq('phone_number', phoneNumber)
        .maybeSingle()
      
      if (tempLookupError) throw tempLookupError
      
      if (!tempUser) {
        throw new Error('No verification in progress for this phone number')
      }
      
      if (tempUser.otp_secret === otp && new Date(tempUser.otp_valid_until) > new Date()) {
        // Create a new user with this phone number
        const { data: { user }, error: signUpError } = await supabaseClient.auth.admin.createUser({
          email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.aditron.app`,
          password: crypto.randomUUID().toString(),
          phone: phoneNumber,
          email_confirm: true,
          user_metadata: {
            phone_number: phoneNumber
          }
        })

        if (signUpError) throw signUpError
        
        if (!user) {
          throw new Error('Failed to create user account')
        }
        
        userId = user.id
        isVerified = true
        
        // Clean up the temporary verification
        await supabaseClient
          .from('phone_verification')
          .delete()
          .eq('phone_number', phoneNumber)
      } else {
        throw new Error('Invalid or expired OTP')
      }
    }

    if (isVerified && userId) {
      // Generate a session for the user
      const { data: { session }, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: userId
      })
      
      if (sessionError) throw sessionError

      return new Response(
        JSON.stringify({ 
          message: 'OTP verified successfully',
          success: true,
          session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error('Verification failed')
    }
  } catch (error) {
    console.error('Error in verify-otp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
