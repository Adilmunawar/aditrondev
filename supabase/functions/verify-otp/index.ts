
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

    const userId = req.headers.get('Authorization')?.split(' ')[1]
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify the OTP
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('phone_number', phoneNumber)
      .single()

    if (fetchError || !profile) {
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
      .eq('id', userId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ message: 'Phone number verified successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
