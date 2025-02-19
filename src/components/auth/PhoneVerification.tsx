
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
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
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: phoneNumber.trim() }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.message,
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
      const { error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: phoneNumber.trim(), otp }
      });

      if (error) throw error;

      toast({
        title: "Verification successful",
        description: "Your phone number has been verified",
      });
      onVerificationComplete();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
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
              <InputOTP
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, index) => (
                      <InputOTPSlot
                        key={index}
                        {...slot}
                        className="w-12 h-12 text-2xl"
                      />
                    ))}
                  </InputOTPGroup>
                )}
              />
              <Button
                onClick={verifyOTP}
                disabled={isLoading}
                className="w-full py-6 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
