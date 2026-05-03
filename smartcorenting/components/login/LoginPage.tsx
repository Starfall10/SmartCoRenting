/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { ViewType, UserData } from "@/types";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { checkUserExists, createUser, getUserData } from "@/lib/firebase/user";

interface LoginPageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  setCurrentUser: (user: UserData | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  setActiveView,
  isDarkMode,
  setCurrentUser,
}) => {
  const [isCreating, setIsCreating] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = async (
    uid: string,
    userEmail: string,
    name?: string,
    photoURL?: string,
  ) => {
    try {
      // Create session cookie
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, email: userEmail, displayName: name }),
      });

      // Check if user exists in database
      const userExists = await checkUserExists(uid);

      if (userExists) {
        // Existing user - fetch their data and go to home
        const userData = await getUserData(uid);
        setCurrentUser(userData);

        // If profile is incomplete, send to profile completion
        if (userData && !userData.profileComplete) {
          setActiveView("addprofile");
        } else {
          setActiveView("home");
        }
      } else {
        // New user - create entry and go to add profile
        const newUser = await createUser(uid, userEmail, name, photoURL);
        setCurrentUser(newUser);
        setActiveView("addprofile");
      }
    } catch (err) {
      console.error("Error handling auth success:", err);
      setError("Failed to complete login. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let user;
      if (isCreating) {
        user = await signUpWithEmail(email, password, displayName || undefined);
      } else {
        user = await signInWithEmail(email, password);
      }

      await handleAuthSuccess(
        user.uid,
        user.email || email,
        user.displayName || displayName,
      );
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await signInWithGoogle();
      await handleAuthSuccess(
        user.uid,
        user.email || "",
        user.displayName || undefined,
        user.photoURL || undefined,
      );
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
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

        <div className="my-8 w-full max-w-sm flex items-center gap-4">
          <div
            className={`h-px flex-1 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}
          />
          <span
            className={`text-xs uppercase tracking-[0.3em] ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
          >
            OR
          </span>
          <div
            className={`h-px flex-1 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}
          />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full max-w-sm py-4 rounded-full font-medium transition-colors border flex items-center justify-center gap-3 ${
            isDarkMode
              ? "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-950 disabled:text-gray-500"
              : "border-gray-300 bg-white text-black hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          }`}
        >
          <FcGoogle className="h-5 w-5" aria-hidden="true" />
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
