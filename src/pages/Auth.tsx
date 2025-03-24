
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PermissionsRequest } from "@/components/auth/PermissionsRequest";
import { AuthForm } from "@/components/auth/AuthForm";
import { Onboarding } from "@/components/auth/Onboarding";
import { TwoFactorAuth } from "@/components/auth/TwoFactorAuth";

type AuthStep = "auth" | "twoFactor" | "onboarding" | "permissions";

const Auth = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("auth");
  const [userId, setUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
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
            setIsNewUser(false);
            setCurrentStep("twoFactor");
          } else {
            setCurrentStep("onboarding");
          }
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleAuthComplete = (uid: string, newUser: boolean) => {
    setUserId(uid);
    setIsNewUser(newUser);
    setCurrentStep("twoFactor");
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
    <div className="relative overflow-hidden">
      {currentStep === "auth" && (
        <AuthForm onAuthComplete={handleAuthComplete} />
      )}
      {currentStep === "twoFactor" && userId && (
        <TwoFactorAuth 
          userId={userId} 
          isNewUser={isNewUser} 
          onComplete={handleTwoFactorComplete}
          onBack={() => setCurrentStep("auth")}
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
