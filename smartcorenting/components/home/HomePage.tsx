import React from "react";
import { ViewType } from "@/types";

interface HomePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveView, isDarkMode }) => {
  return (
    <div
      className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <h2
        className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Home
      </h2>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hi Winston</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Let&apos;s find the right people to live with
        </p>
      </div>

      {/* Profile Creation Card */}
      <div
        className={`rounded-2xl p-6 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <h3 className="text-lg font-semibold mb-2">Profile Creation</h3>
        <p
          className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Step 4 of 10
        </p>

        <div
          className={`w-full rounded-full h-2 mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
        >
          <div
            className={`rounded-full h-2 ${isDarkMode ? "bg-white" : "bg-indigo-600"}`}
            style={{ width: "40" }}
          ></div>
        </div>

        <button
          onClick={() => setActiveView("addprofile")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-full transition-colors"
        >
          Continue setting up your profile
        </button>
      </div>

      {/* No Matches Card */}
      <div
        className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <h3 className="text-lg font-semibold mb-1">No Matches yet</h3>
        <p
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Finish setting up your profile to start matching
        </p>
      </div>
    </div>
  );
};

export default HomePage;
