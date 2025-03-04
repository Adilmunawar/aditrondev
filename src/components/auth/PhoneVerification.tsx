
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Phone, ArrowRight, Loader2, KeyRound, Shield, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

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
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'success' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorAttempts, setErrorAttempts] = useState(0);

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
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: phoneNumber.trim() }
      });

      if (error) {
        console.error("Error invoking send-otp function:", error);
        setErrorMessage(error.message || "Failed to send verification code");
        setVerificationStep('error');
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
      setErrorMessage(error.message || "Failed to send verification code. Please try again.");
      setVerificationStep('error');
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
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: phoneNumber.trim(), otp }
      });

      if (error) {
        console.error("Error invoking verify-otp function:", error);
        setErrorMessage(error.message || "Failed to verify code");
        setErrorAttempts(prev => prev + 1);
        
        if (errorAttempts >= 2) {
          setVerificationStep('error');
        }
        
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
      setErrorMessage(error.message || "Failed to verify code. Please try again.");
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
    setErrorMessage(null);
    setErrorAttempts(0);
  };

  const retryAfterError = () => {
    if (otpSent) {
      setVerificationStep('verify');
    } else {
      setVerificationStep('input');
    }
    setErrorMessage(null);
    setErrorAttempts(0);
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
            {verificationStep === 'input' && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Welcome Back</h1>
                  <p className="text-muted-foreground">Enter your phone number to continue</p>
                </div>
                
                <div className="p-1 border border-input rounded-lg bg-secondary/30 shadow-inner hover:shadow-md transition-shadow">
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
                      <span className="relative z-10 group-hover:translate-x-1 transition-transform">Continue</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                    </>
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline transition-colors">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline transition-colors">Privacy Policy</a>
                </div>
              </div>
            )}

            {verificationStep === 'verify' && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center space-y-2">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse-slow">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Verify Your Phone</h1>
                  <p className="text-muted-foreground">
                    We've sent a 6-digit code to <span className="font-medium text-foreground">{phoneNumber}</span>
                  </p>
                  {countdown > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Code expires in <span className="font-medium text-primary">{formatTime(countdown)}</span>
                    </p>
                  )}
                </div>

                {devOtp && (
                  <div className="p-3 bg-secondary/50 border border-border rounded-md text-center shadow-inner">
                    <p className="text-muted-foreground font-medium flex items-center justify-center">
                      <KeyRound className="w-4 h-4 mr-2 text-primary" />
                      Development OTP: <span className="font-bold ml-2 text-primary tracking-wider">{devOtp}</span>
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
                            className={cn(
                              "w-12 h-14 text-xl border-border bg-secondary/30 shadow-inner transition-all",
                              "focus:ring-primary focus:border-primary focus:shadow-lg"
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                
                <Button
                  onClick={verifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-6 text-lg bg-primary hover:bg-primary/90 transition-colors relative overflow-hidden group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                      Verify Code
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                    </div>
                  )}
                </Button>
                
                <div className="flex items-center justify-between text-sm">
                  <button 
                    className="text-muted-foreground hover:text-primary flex items-center transition-colors"
                    onClick={handleBackToInput}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Change Number
                  </button>
                  
                  <button 
                    className={cn(
                      "text-primary hover:underline transition-colors",
                      countdown > 270 && "text-muted-foreground cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (countdown <= 270) {
                        setOtp("");
                        setDevOtp(null);
                        sendOTP();
                      }
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
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce-slow">
                    <CheckCircle className="h-10 w-10 text-green-600 animate-pulse-scale" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-primary">Verification Successful</h1>
                <p className="text-muted-foreground">You're being redirected to your account...</p>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress-bar rounded-full"></div>
                </div>
              </div>
            )}

            {verificationStep === 'error' && (
              <div className="space-y-6 text-center animate-fade-up">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-600 animate-pulse" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-red-600">Verification Failed</h1>
                <p className="text-muted-foreground">
                  {errorMessage || "We couldn't verify your phone number. Please try again."}
                </p>
                <Button
                  onClick={retryAfterError}
                  className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                >
                  Try Again
                </Button>
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
