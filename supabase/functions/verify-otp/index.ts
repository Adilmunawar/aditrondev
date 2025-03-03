
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phoneNumber, otp } = await req.json()
    
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required')
    }

    console.log(`Verifying OTP for ${phoneNumber}`)

    // First check if we have an existing user with this phone number
    const { data: existingUser, error: existingUserError } = await supabaseClient
      .from('profiles')
      .select('id, otp_secret, otp_valid_until')
      .eq('phone_number', phoneNumber)
      .maybeSingle()
    
    if (existingUserError) {
      console.error('Error checking for existing user:', existingUserError)
      throw existingUserError
    }

    if (existingUser) {
      console.log(`Found existing user: ${existingUser.id}`)
      
      // Validate OTP for existing user
      if (existingUser.otp_secret !== otp) {
        console.error('Invalid OTP provided for existing user')
        throw new Error('Invalid verification code')
      }

      // Check if OTP is expired
      if (new Date(existingUser.otp_valid_until) < new Date()) {
        console.error('OTP has expired for existing user')
        throw new Error('Verification code has expired')
      }
      
      // Mark the user's phone as verified
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          phone_verified: true,
          otp_secret: null  // Clear the OTP after successful verification
        })
        .eq('id', existingUser.id)
      
      if (updateError) {
        console.error('Error updating user profile:', updateError)
        throw updateError
      }
      
      // Get the user from auth.users
      const { data: authUser, error: authUserError } = await supabaseClient.auth.admin.getUserById(
        existingUser.id
      )
      
      if (authUserError) {
        console.error('Error getting auth user:', authUserError)
        throw authUserError
      }
      
      // Create a new session for the user
      const { data: session, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: existingUser.id
      })
      
      if (sessionError) {
        console.error('Error creating session:', sessionError)
        throw sessionError
      }
      
      console.log(`Created session for existing user: ${existingUser.id}`)
      
      return new Response(
        JSON.stringify({ 
          message: 'Phone number verified successfully',
          session: session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Check if a temporary verification record exists
      const { data: tempUser, error: tempUserError } = await supabaseClient
        .from('phone_verification')
        .select('otp_secret, otp_valid_until')
        .eq('phone_number', phoneNumber)
        .maybeSingle()
      
      if (tempUserError) {
        console.error('Error checking temporary user:', tempUserError)
        throw tempUserError
      }
      
      if (!tempUser) {
        console.error('No verification record found')
        throw new Error('No verification record found for this phone number')
      }
      
      // Validate OTP for temporary user
      if (tempUser.otp_secret !== otp) {
        console.error('Invalid OTP provided for new user')
        throw new Error('Invalid verification code')
      }
      
      // Check if OTP is expired
      if (new Date(tempUser.otp_valid_until) < new Date()) {
        console.error('OTP has expired for new user')
        throw new Error('Verification code has expired')
      }
      
      console.log('OTP verified for new user, creating account')
      
      // Create a new user with random password (they'll only log in via OTP)
      const password = Math.random().toString(36).slice(-10)
      
      // Create a new user in auth.users
      const { data: newAuthUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.example.com`,
        phone: phoneNumber,
        password: password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          phone_number: phoneNumber
        }
      })
      
      if (createUserError) {
        console.error('Error creating new user:', createUserError)
        throw createUserError
      }
      
      // Update the user's profile with phone verified
      const { error: updateProfileError } = await supabaseClient
        .from('profiles')
        .update({
          phone_number: phoneNumber,
          phone_verified: true
        })
        .eq('id', newAuthUser.user.id)
      
      if (updateProfileError) {
        console.error('Error updating new profile:', updateProfileError)
        throw updateProfileError
      }
      
      // Delete the temporary verification record
      const { error: deleteError } = await supabaseClient
        .from('phone_verification')
        .delete()
        .eq('phone_number', phoneNumber)
      
      if (deleteError) {
        console.error('Error deleting temporary record:', deleteError)
        // Non-critical error, continue
      }
      
      // Create a new session for the user
      const { data: session, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: newAuthUser.user.id
      })
      
      if (sessionError) {
        console.error('Error creating session for new user:', sessionError)
        throw sessionError
      }
      
      console.log(`Created new user and session: ${newAuthUser.user.id}`)
      
      return new Response(
        JSON.stringify({ 
          message: 'New user created and verified successfully',
          session: session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in verify-otp function:', error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify OTP" }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
