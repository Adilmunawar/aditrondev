
import { useState, useEffect } from "react";
import crypto from "crypto";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PermissionsRequest } from "@/components/auth/PermissionsRequest";
import { Onboarding } from "@/components/auth/Onboarding";
import { TwoFactorAuth } from "@/components/auth/TwoFactorAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type AuthStep = "username" | "twoFactor" | "onboarding" | "permissions";

const Auth = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("username");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/");
        } else if (profile) {
          // If user has an OTP secret but hasn't completed onboarding
          if (profile.otp_secret) {
            setCurrentStep("twoFactor");
          } else {
            setCurrentStep("onboarding");
          }
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingUser) {
        // If username exists, sign in as that user
        setUserId(existingUser.id);
        
        // Create a session for existing user
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: `${username}@example.com`,
          password: "password123" // Note: This is a placeholder, in a real app you'd verify identity differently
        });
        
        if (sessionError) {
          // If can't sign in, create anonymous auth
          const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: `${username}@example.com`,
            password: crypto.randomBytes(16).toString('base64').slice(0, 16)
          });
          
          if (signUpError) throw signUpError;
        }
        
        setCurrentStep("twoFactor");
      } else {
        // Create new user with anonymous auth
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email: `${username}@example.com`,
          password: crypto.randomBytes(16).toString('base64').slice(0, 16),
          options: {
            data: {
              username
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (user) {
          setUserId(user.id);
          // Skip directly to two-factor setup
          setCurrentStep("twoFactor");
        }
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

  const handleTwoFactorComplete = () => {
    setCurrentStep("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentStep("permissions");
  };

  const handlePermissionsComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {currentStep === "username" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Aditron</h1>
              <p className="text-gray-400">Enter your username to continue</p>
            </div>
            
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="py-6 text-lg bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                autoFocus
              />
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {currentStep === "twoFactor" && userId && (
        <TwoFactorAuth 
          userId={userId} 
          isNewUser={true} 
          onComplete={handleTwoFactorComplete}
          onBack={() => setCurrentStep("username")}
        />
      )}

      {currentStep === "onboarding" && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {currentStep === "permissions" && (
        <PermissionsRequest onComplete={handlePermissionsComplete} />
      )}
    </div>
  );
};

export default Auth;
