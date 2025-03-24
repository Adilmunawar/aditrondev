
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  onAuthComplete: (userId: string, isNewUser: boolean) => void;
}

export const AuthForm = ({ onAuthComplete }: AuthFormProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [loginMode, setLoginMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return false;
    }

    // Check if username exists in the database
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (data) {
      setUsernameError("This username is already taken");
      return false;
    } else {
      setUsernameError(null);
      return true;
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Clear any previous error when user starts typing
    if (usernameError) setUsernameError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginMode && !await validateUsername(username)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (loginMode) {
        // Handle login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw new Error(signInError.message);
        
        if (data?.user) {
          // Check if user has completed onboarding
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("onboarding_completed, otp_secret")
            .eq("id", data.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
          
          onAuthComplete(data.user.id, false);
        }
      } else {
        // Handle signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });

        if (signUpError) throw new Error(signUpError.message);
        
        if (data?.user) {
          // Wait a moment for the trigger to create the profile
          setTimeout(async () => {
            onAuthComplete(data.user.id, true);
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setLoginMode(!loginMode);
    // Clear form when toggling mode
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setUsernameError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-lg animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {loginMode ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="text-muted-foreground">
            {loginMode
              ? "Sign in to access your account"
              : "Sign up to get started with Aditron"}
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {!loginMode && (
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                className={`py-6 text-lg ${usernameError ? 'border-red-500' : ''}`}
                required
              />
              {usernameError && (
                <p className="text-sm text-red-500 mt-1">{usernameError}</p>
              )}
            </div>
          )}
          
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-6 text-lg"
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-6 text-lg"
            required
          />
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : loginMode ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => toggleMode()}
            className="text-primary hover:underline text-sm font-medium"
            type="button"
          >
            {loginMode
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
