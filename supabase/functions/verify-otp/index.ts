
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phoneNumber, otp } = await req.json()
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required')
    }

    // Verify the OTP
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    if (fetchError) {
      throw new Error('Invalid verification attempt')
    }

    if (profile.otp_secret !== otp) {
      throw new Error('Invalid OTP')
    }

    if (new Date(profile.otp_valid_until) < new Date()) {
      throw new Error('OTP has expired')
    }

    // Mark the phone as verified
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        phone_verified: true,
        otp_secret: null,
        otp_valid_until: null
      })
      .eq('id', profile.id)

    if (updateError) throw updateError

    // Sign in the user
    const { data: { user }, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.aditron.app`,
      password: profile.id // This will be the encrypted auth.users.id stored in the database
    })

    if (signInError) {
      // If signing in fails, try to recover by getting an access token directly
      const { data: { session }, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: profile.id
      })

      if (sessionError) throw sessionError

      return new Response(
        JSON.stringify({ 
          message: 'Phone number verified successfully',
          session: session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Phone number verified successfully',
        user: user
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
