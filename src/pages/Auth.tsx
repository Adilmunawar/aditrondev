
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PermissionsRequest } from "@/components/auth/PermissionsRequest";
import { AuthForm } from "@/components/auth/AuthForm";
import { Onboarding } from "@/components/auth/Onboarding";

type AuthStep = "auth" | "onboarding" | "permissions";

const Auth = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("auth");
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
        } else if (profile) {
          setCurrentStep("onboarding");
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleAuthComplete = () => {
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
