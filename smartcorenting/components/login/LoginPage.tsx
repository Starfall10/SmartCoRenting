/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { ViewType } from "@/types";
import { signUpWithEmail, signInWithEmail } from "@/lib/firebase/auth";

interface LoginPageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ setActiveView, isDarkMode }) => {
  const [isCreating, setIsCreating] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    // Simulate authentication
    setActiveView("home");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isCreating) {
        await signUpWithEmail(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      setActiveView("home");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {isCreating && (
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  : "bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              }`}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-4 py-3 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                : "bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            }`}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`w-full px-4 py-3 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                : "bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            }`}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-medium transition-colors ${
              isDarkMode
                ? "bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
            }`}
          >
            {loading ? "Loading..." : isCreating ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="w-full max-w-sm my-6 flex items-center gap-4">
          <div
            className={`flex-1 h-px ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}
          />
          <span
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            OR
          </span>
          <div
            className={`flex-1 h-px ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}
          />
        </div>

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
          onClick={() => {
            setIsCreating(!isCreating);
            setError("");
          }}
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
