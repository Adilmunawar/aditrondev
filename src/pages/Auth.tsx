
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { Onboarding } from "@/components/auth/Onboarding";
import { PermissionsRequest } from "@/components/auth/PermissionsRequest";

type AuthStep = "phone" | "onboarding" | "permissions";

const Auth = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("phone");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/");
        } else if (profile?.phone_verified) {
          setCurrentStep("onboarding");
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleVerificationComplete = () => {
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
      {currentStep === "phone" && (
        <PhoneVerification onVerificationComplete={handleVerificationComplete} />
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
