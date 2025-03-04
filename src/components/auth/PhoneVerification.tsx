
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Phone, ArrowRight, Loader2, KeyRound, Shield, ArrowLeft, CheckCircle } from "lucide-react";
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
  const [countdown, setCountdown] = useState(0);
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'success'>('input');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

      if (error) {
        console.error("Error invoking send-otp function:", error);
        throw new Error(error.message || "Failed to send verification code");
      }

      // For development only - store the OTP to display
      if (data && data.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setOtpSent(true);
      setVerificationStep('verify');
      setCountdown(300); // 5 minutes countdown
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      console.error("Error in sendOTP:", error);
      toast({
        title: "Error sending OTP",
        description: error.message || "Failed to send verification code. Please try again.",
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

      if (error) {
        console.error("Error invoking verify-otp function:", error);
        throw new Error(error.message || "Failed to verify code");
      }

      // If we have a session in the response, set it
      if (data && data.session) {
        await supabase.auth.setSession(data.session);
      }

      setVerificationStep('success');
      toast({
        title: "Verification successful",
        description: "Your phone number has been verified",
      });
      
      // Short delay before completing to show success animation
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    } catch (error: any) {
      console.error("Error in verifyOTP:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setOtp("");
    setDevOtp(null);
    setOtpSent(false);
    setVerificationStep('input');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 p-8">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/5"></div>
          
          {/* Logo or app name */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-primary">Aditron</h2>
            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
            {verificationStep === 'input' && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">Welcome Back</h1>
                  <p className="text-muted-foreground">Enter your phone number to continue</p>
                </div>
                
                <div className="p-1 border border-input rounded-lg bg-secondary/30 shadow-inner">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 py-6 text-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={sendOTP}
                  disabled={isLoading || !phoneNumber.trim()}
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
                
                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </div>
              </div>
            )}

            {verificationStep === 'verify' && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center space-y-2">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">Verify Your Phone</h1>
                  <p className="text-muted-foreground">
                    We've sent a 6-digit code to {phoneNumber}
                  </p>
                  {countdown > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Code expires in <span className="font-medium text-primary">{formatTime(countdown)}</span>
                    </p>
                  )}
                </div>

                {devOtp && (
                  <div className="p-3 bg-secondary/50 border border-border rounded-md text-center">
                    <p className="text-muted-foreground font-medium flex items-center justify-center">
                      <KeyRound className="w-4 h-4 mr-2 text-primary" />
                      Development OTP: <span className="font-bold ml-2 text-primary">{devOtp}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This would be sent via SMS in production</p>
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
                            className="w-12 h-14 text-xl border-border bg-secondary/30 shadow-inner"
                          />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                
                <Button
                  onClick={verifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center">
                      Verify Code
                    </div>
                  )}
                </Button>
                
                <div className="flex items-center justify-between text-sm">
                  <button 
                    className="text-muted-foreground hover:text-primary flex items-center"
                    onClick={handleBackToInput}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Change Number
                  </button>
                  
                  <button 
                    className="text-primary hover:underline" 
                    onClick={() => {
                      setOtp("");
                      setDevOtp(null);
                      sendOTP();
                    }}
                    disabled={isLoading || countdown > 270} // Allow resend after 30 seconds
                  >
                    {countdown > 270 ? `Resend in ${formatTime(countdown - 270)}` : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            {verificationStep === 'success' && (
              <div className="space-y-6 text-center animate-fade-up">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 animate-pulse-scale" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold">Verification Successful</h1>
                <p className="text-muted-foreground">You're being redirected to your account...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
