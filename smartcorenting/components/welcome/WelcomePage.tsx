import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { ViewType } from "@/types";

interface WelcomePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  setActiveView,
  isDarkMode,
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <p
        className={`text-sm mb-16 self-start ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        welcome
      </p>

      <div className="flex flex-col items-center justify-center flex-1">
        <FaUserPlus size={80} className="mb-12" />

        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to
          <br />
          Smart Co-Renting
        </h1>

        <p
          className={`text-center mb-12 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Match with compatible renters,
          <br />
          not random strangers.
        </p>

        <button
          onClick={() => setActiveView("login")}
          className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
