
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { supabase } from "@/integrations/supabase/client";

const PhoneLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handleVerificationComplete = () => {
    navigate("/");
  };

  return (
    <div className="relative overflow-hidden">
      <PhoneVerification onVerificationComplete={handleVerificationComplete} />
    </div>
  );
};

export default PhoneLogin;
