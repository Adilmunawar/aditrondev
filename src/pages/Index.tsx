
import { Layout } from "@/components/Layout";
import { SplashScreen } from "@/components/SplashScreen";
import { useState } from "react";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <Layout>
          <div className="h-full rounded-xl overflow-hidden shadow-lg">
            {/* The Layout component will render the appropriate panel */}
          </div>
        </Layout>
      )}
    </>
  );
};

export default Index;
