import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { ViewType } from "@/types";

interface LoginPageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ setActiveView, isDarkMode }) => {
  const [isCreating, setIsCreating] = useState(true);

  const handleGoogleAuth = () => {
    // Simulate authentication
    setActiveView("home");
  };

  return (
    <div
      className={`min-h-screen flex flex-col p-6 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <p
        className={`text-sm mb-32 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {isCreating ? "createAccount" : "login"}
      </p>

      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold text-center mb-12">
          {isCreating ? "Create an account" : "Login to your account"}
        </h1>

        <button
          onClick={handleGoogleAuth}
          className={`flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-full font-medium transition-colors ${
            isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-black border border-gray-300"
          }`}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`mt-8 text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
        >
          {isCreating
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
