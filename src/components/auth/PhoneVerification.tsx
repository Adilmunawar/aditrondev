
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Phone, ArrowRight, Loader2, KeyRound, Shield } from "lucide-react";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
}

export const PhoneVerification = ({ onVerificationComplete }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: phoneNumber.trim() }
      });

      if (error) throw error;

      // For development only - store the OTP to display
      if (data && data.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: phoneNumber.trim(), otp }
      });

      if (error) throw error;

      // If we have a session in the response, set it
      if (data && data.session) {
        await supabase.auth.setSession(data.session);
      }

      toast({
        title: "Verification successful",
        description: "Your phone number has been verified",
      });
      onVerificationComplete();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {otpSent ? "Enter Verification Code" : "Welcome to Aditron"}
          </h1>
          <p className="text-muted-foreground">
            {otpSent
              ? "We've sent a 6-digit code to your phone"
              : "Enter your phone number to get started"}
          </p>
        </div>

        <div className="space-y-6">
          {!otpSent ? (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
              <Button
                onClick={sendOTP}
                disabled={isLoading}
                className="w-full py-6 text-lg relative overflow-hidden group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devOtp && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                  <p className="text-yellow-800 font-medium flex items-center justify-center">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Development OTP: <span className="font-bold ml-2">{devOtp}</span>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">This would be sent via SMS in production</p>
                </div>
              )}
              
              <div className="flex justify-center my-4">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2">
                      {slots.map((slot, idx) => (
                        <InputOTPSlot
                          key={idx}
                          {...slot}
                          index={idx}
                          className="w-12 h-12 text-2xl"
                        />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              
              <Button
                onClick={verifyOTP}
                disabled={isLoading}
                className="w-full py-6 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Verify
                  </div>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-2">
                Didn't receive the code?{" "}
                <button 
                  className="text-primary hover:underline" 
                  onClick={() => {
                    setOtp("");
                    setDevOtp(null);
                    setOtpSent(false);
                  }}
                >
                  Try again
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
