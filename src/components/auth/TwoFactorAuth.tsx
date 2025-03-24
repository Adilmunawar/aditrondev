
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import QRCode from "./QRCode";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import * as OTPAuth from "otpauth";

interface TwoFactorAuthProps {
  userId: string;
  isNewUser: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export const TwoFactorAuth = ({ userId, isNewUser, onComplete, onBack }: TwoFactorAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpSecret, setOtpSecret] = useState("");
  const [otpUri, setOtpUri] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateOTPSecret = async () => {
      try {
        if (isNewUser) {
          // Generate a new OTP secret for new users
          const secret = new OTPAuth.Secret();
          setOtpSecret(secret.base32);
          
          // Create OTP URI for QR code
          const totp = new OTPAuth.TOTP({
            issuer: "Aditron",
            label: "User",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret
          });
          
          setOtpUri(totp.toString());
          
          // Save the OTP secret to the user's profile
          const { error } = await supabase
            .from("profiles")
            .update({ 
              otp_secret: secret.base32,
              otp_valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Valid for 30 minutes
            })
            .eq("id", userId);
            
          if (error) {
            console.error("Error saving OTP secret:", error);
            setError("Failed to setup 2FA. Please try again.");
          }
        } else {
          // For existing users, fetch their OTP secret
          const { data, error } = await supabase
            .from("profiles")
            .select("otp_secret")
            .eq("id", userId)
            .single();
            
          if (error || !data) {
            console.error("Error fetching OTP secret:", error);
            setError("Failed to load 2FA settings. Please try again.");
            return;
          }
          
          setOtpSecret(data.otp_secret || "");
        }
      } catch (error) {
        console.error("Error in 2FA setup:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    generateOTPSecret();
  }, [userId, isNewUser]);

  const verifyOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!otpSecret) {
        setError("OTP setup is incomplete. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const totp = new OTPAuth.TOTP({
        issuer: "Aditron",
        label: "User",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(otpSecret)
      });

      // Verify the OTP code
      const isValid = totp.validate({ token: otpValue, window: 1 }) !== null;

      if (isValid) {
        // If valid, mark authentication as complete
        toast({
          title: "Authentication successful",
          description: "Two-factor authentication complete",
        });
        onComplete();
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser ? "Set Up Two-Factor Authentication" : "Two-Factor Authentication"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser 
              ? "Scan the QR code with an authenticator app and enter the verification code"
              : "Enter the verification code from your authenticator app"}
          </p>
        </div>

        <div className="space-y-6">
          {isNewUser && otpUri && (
            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
              <QRCode value={otpUri} size={200} className="mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with Google Authenticator, Authy, or any other TOTP app
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, i) => (
                    <InputOTPSlot key={i} {...slot} index={i} />
                  ))}
                </InputOTPGroup>
              )}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={verifyOTP}
              disabled={isLoading || otpValue.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
