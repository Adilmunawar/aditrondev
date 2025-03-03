
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      throw new Error('Server configuration error');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const { phoneNumber, otp } = await req.json();
    
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    console.log(`Verifying OTP for ${phoneNumber}`);

    // First check profiles table for existing users
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, otp_secret, otp_valid_until')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error checking profiles:', profileError);
    }

    // Verify OTP for existing user
    if (existingProfile?.id) {
      console.log(`Found existing user: ${existingProfile.id}`);
      
      if (existingProfile.otp_secret !== otp) {
        console.error('Invalid OTP for existing user');
        throw new Error('Invalid verification code');
      }

      if (new Date(existingProfile.otp_valid_until) < new Date()) {
        console.error('Expired OTP for existing user');
        throw new Error('Verification code has expired');
      }
      
      // Mark phone as verified and clear OTP
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          phone_verified: true,
          otp_secret: null
        })
        .eq('id', existingProfile.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Failed to verify phone');
      }
      
      // Create session for existing user
      const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: existingProfile.id
      });
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw sessionError;
      }
      
      return new Response(
        JSON.stringify({ 
          message: 'Phone verified successfully',
          session: session
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Check temp verification table for new users
      const { data: tempVerification, error: verificationError } = await supabaseAdmin
        .from('phone_verification')
        .select('otp_secret, otp_valid_until')
        .eq('phone_number', phoneNumber)
        .maybeSingle();
      
      if (verificationError) {
        console.error('Error checking verification:', verificationError);
      }
      
      if (!tempVerification) {
        console.error('No verification record found');
        throw new Error('No verification record found');
      }
      
      if (tempVerification.otp_secret !== otp) {
        console.error('Invalid OTP for new user');
        throw new Error('Invalid verification code');
      }
      
      if (new Date(tempVerification.otp_valid_until) < new Date()) {
        console.error('Expired OTP for new user');
        throw new Error('Verification code has expired');
      }
      
      console.log('OTP verified for new user, creating account');
      
      // Generate a secure random password
      const password = crypto.randomUUID();
      
      // Create a new user
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.example.com`,
        phone: phoneNumber,
        phone_confirm: true,
        password: password,
        email_confirm: true
      });
      
      if (createUserError) {
        console.error('Error creating user:', createUserError);
        throw createUserError;
      }
      
      // Update the new user's profile
      if (newUser?.user) {
        const { error: updateProfileError } = await supabaseAdmin
          .from('profiles')
          .update({
            phone_number: phoneNumber,
            phone_verified: true
          })
          .eq('id', newUser.user.id);
        
        if (updateProfileError) {
          console.error('Error updating profile:', updateProfileError);
        }
        
        // Clean up the verification record
        await supabaseAdmin
          .from('phone_verification')
          .delete()
          .eq('phone_number', phoneNumber);
        
        // Create a session
        const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
          user_id: newUser.user.id
        });
        
        if (sessionError) {
          console.error('Error creating session:', sessionError);
          throw sessionError;
        }
        
        return new Response(
          JSON.stringify({ 
            message: 'Account created and verified',
            session: session
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error('Failed to create user account');
      }
    }
  } catch (error) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify OTP" }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
