
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Key, Eye, EyeOff, User, Shield } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { TOTP } from "otpauth";
import QRCode from "./QRCode";

interface AuthFormProps {
  onAuthComplete: () => void;
}

export const AuthForm = ({ onAuthComplete }: AuthFormProps) => {
  const [username, setUsername] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate a secret key for new user registrations
  useEffect(() => {
    if (authType === "signup" && !secretKey) {
      const newSecret = generateSecret();
      setSecretKey(newSecret);
    }
  }, [authType]);

  const generateSecret = () => {
    // Generate a random base32 encoded secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const validateOtp = (otp: string, secret: string): boolean => {
    try {
      const totp = new TOTP({
        issuer: "Aditron",
        label: username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret
      });
      
      return totp.validate({ token: otp, window: 1 }) !== null;
    } catch (error) {
      console.error("OTP validation error:", error);
      return false;
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter your username to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Clear any previous username errors
    setUsernameError(null);
    setIsLoading(true);
    
    try {
      if (authType === "signin") {
        // For sign in, check if the username exists
        const { data, error } = await supabase
          .from("profiles")
          .select("otp_secret")
          .eq("username", username)
          .single();
        
        if (error) {
          throw new Error("Username not found. Please check your username or sign up for a new account.");
        }
        
        // Show OTP input for verification
        setShowOtpInput(true);
      } else {
        // For signup, check if username is available
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();
        
        if (data) {
          setUsernameError("Username already exists. Please choose another one.");
          throw new Error("Username already exists. Please choose another one.");
        }
        
        // Show secret key for the user to save
        setShowSecretKey(true);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Get the user's secret key from the profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("otp_secret, id")
        .eq("username", username)
        .single();
      
      if (error || !data || !data.otp_secret) {
        throw new Error("Could not retrieve account information");
      }
      
      // Validate the OTP
      if (!validateOtp(otp, data.otp_secret)) {
        throw new Error("Invalid authentication code. Please try again.");
      }
      
      // If valid, create a session by directly setting the session in Supabase
      const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
        email: `${username}@temporary.auth`,
        password: data.otp_secret.substring(0, 20)
      });
      
      if (sessionError) {
        // If user doesn't exist yet in auth system, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${username}@temporary.auth`,
          password: data.otp_secret.substring(0, 20)
        });
        
        if (signUpError) {
          throw new Error("Failed to authenticate: " + signUpError.message);
        }
      }
      
      toast({
        title: "Success",
        description: "You've been authenticated successfully",
      });
      
      onAuthComplete();
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    
    try {
      if (!validateOtp(otp, secretKey)) {
        throw new Error("Invalid authentication code. Please verify your authenticator app is properly set up.");
      }
      
      // First create the auth user
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: `${username}@temporary.auth`,
        password: secretKey.substring(0, 20)
      });
      
      if (userError || !userData.user) {
        throw new Error("Failed to create account: " + userError?.message || "User creation failed");
      }
      
      // Then update the profile with our secret
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username,
          otp_secret: secretKey
        })
        .eq("id", userData.user.id);
      
      if (profileError) {
        // Try to clean up auth user if profile update fails
        throw new Error("Failed to complete registration: " + profileError.message);
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now log in.",
      });
      
      onAuthComplete();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (authType === "signin") {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  const resetForm = () => {
    setShowOtpInput(false);
    setShowSecretKey(false);
    setOtp("");
    setUsernameError(null);
  };

  const handleAuthTypeChange = (type: "signin" | "signup") => {
    setAuthType(type);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 p-8">
          {/* Animated background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/5 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 -right-20 w-20 h-20 rounded-full bg-secondary/10 animate-blob animation-delay-4000"></div>
          
          {/* Logo or app name with animation */}
          <div className="mb-6 text-center relative z-10">
            <h2 className="text-2xl font-bold text-primary animate-fade-in">Aditron</h2>
            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full animate-pulse"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {showOtpInput 
                  ? "Enter Authentication Code" 
                  : showSecretKey 
                    ? "Save Your Secret Key" 
                    : authType === "signin" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground">
                {showOtpInput 
                  ? "Enter the code from your authenticator app" 
                  : showSecretKey 
                    ? "Scan this QR code with your authenticator app"
                    : authType === "signin" 
                      ? "Sign in to your account" 
                      : "Register a new account"}
              </p>
            </div>

            {!showOtpInput && !showSecretKey ? (
              // Initial form (username input)
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`pl-10 ${usernameError ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => handleAuthTypeChange(authType === "signin" ? "signup" : "signin")}
                  >
                    {authType === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  className="w-full py-6 relative overflow-hidden group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {authType === "signin" ? "Continue" : "Register"}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                    </>
                  )}
                </Button>
              </form>
            ) : showSecretKey ? (
              // Secret key display (for signup)
              <div className="space-y-6">
                <div className="p-4 bg-background rounded-lg">
                  <QRCode 
                    value={`otpauth://totp/Aditron:${username}?secret=${secretKey}&issuer=Aditron&algorithm=SHA1&digits=6&period=30`}
                    size={200}
                    className="mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center font-mono text-sm break-all">
                    {secretKey}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save this secret key in a secure place. You will need it if you lose access to your authenticator app.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 relative overflow-hidden group"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify & Complete
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // OTP input (for signin)
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Authentication Code</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 relative overflow-hidden group"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Login tips or help text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? <a href="#" className="text-primary hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};
