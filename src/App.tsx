
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import "./App.css";

function App() {
  // Create storage bucket on app initialization if it doesn't exist
  useEffect(() => {
    const createAvatarsBucket = async () => {
      try {
        const { data, error } = await supabase.storage.getBucket('avatars');
        if (error) {
          // Bucket might not exist, create it
          const { error: createError } = await supabase.storage.createBucket('avatars', {
            public: true
          });
          if (createError) {
            console.error("Error creating avatars bucket:", createError);
          } else {
            console.log("Avatars bucket created successfully");
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }
    };

    createAvatarsBucket();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
