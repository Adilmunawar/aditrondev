
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, GitHub, Google, Key, Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  onAuthComplete: () => void;
}

export const AuthForm = ({ onAuthComplete }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      let response;
      if (authType === "signin") {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (authType === "signin" && response.data.session) {
        toast({
          title: "Success",
          description: "You are now signed in",
        });
        onAuthComplete();
      } else if (authType === "signup") {
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
        // For signup, depending on Supabase settings, the user might need to confirm email
        // If autoconfirm is enabled, we can proceed to onboarding
        if (response.data.session) {
          onAuthComplete();
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Google authentication failed",
        description: error.message || "An error occurred during Google authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("GitHub auth error:", error);
      toast({
        title: "GitHub authentication failed",
        description: error.message || "An error occurred during GitHub authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">Sign in to your account or create a new one</p>
            </div>

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => setAuthType(authType === "signin" ? "signup" : "signin")}
                    >
                      {authType === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full py-6 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {authType === "signin" ? "Sign In" : "Create Account"}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <Google className="mr-2 h-5 w-5" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium"
                    onClick={handleGitHubAuth}
                    disabled={isLoading}
                  >
                    <GitHub className="mr-2 h-5 w-5" />
                    Continue with GitHub
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      More options coming soon
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
