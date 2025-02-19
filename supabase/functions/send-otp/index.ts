
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

    const { phoneNumber } = await req.json()
    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpValidUntil = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // For development, we'll just log the OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`)

    // Store the OTP in the database
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        phone_number: phoneNumber,
        otp_secret: otp,
        otp_valid_until: otpValidUntil.toISOString(),
        phone_verified: false
      })
      .eq('id', req.headers.get('Authorization')?.split(' ')[1])

    if (updateError) throw updateError

    // In production, you would integrate with an SMS service here
    // await sendSMS(phoneNumber, `Your verification code is: ${otp}`)

    return new Response(
      JSON.stringify({ message: 'OTP sent successfully' }),
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
