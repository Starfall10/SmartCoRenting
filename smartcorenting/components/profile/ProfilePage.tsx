import React, { useState } from "react";
import { FaCog, FaEdit, FaTimes } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { ViewType } from "@/types";

interface ProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  setActiveView,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    setShowSettings(false);
    setActiveView("login");
  };

  return (
    <div
      className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="flex justify-between items-center mb-8">
        <h2
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Profile
        </h2>
        <button
          onClick={() => setShowSettings(true)}
          className={`hover:opacity-70 ${isDarkMode ? "text-white" : "text-black"}`}
        >
          <FaCog size={24} />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      {/* Profile Header */}
      <div className="flex items-center mb-8">
        <div
          className={`w-20 h-20 rounded-full mr-4 flex items-center justify-center overflow-hidden ${
            isDarkMode ? "bg-gray-600" : "bg-gray-300"
          }`}
        >
          <span className="text-3xl">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Winston Harold</h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Age: 24
          </p>
        </div>
      </div>

      {/* Life Style Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Life Style</h3>
          <button
            className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
          >
            <FaEdit size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Night Owl
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Very Tidy
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Quiet Home
          </span>
        </div>
      </div>

      {/* Hard Constraints Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Hard Constraints</h3>
          <button
            className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
          >
            <FaEdit size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Zone 2
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Long-Term
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
          >
            Male Only
          </span>
        </div>
      </div>

      {/* About Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">About</h3>
          <button
            className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
          >
            <FaEdit size={16} />
          </button>
        </div>
        <p
          className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. It has survived not
          only five centuries, but also the leap into electronic typesetting,
          remaining essentially including versions of Lorem Ipsum.
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md m-6 rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-white"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="hover:opacity-70"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="mb-6">
              <label className="text-lg font-semibold mb-3 block">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDarkMode(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                    !isDarkMode
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <MdLightMode size={20} />
                  Light
                </button>
                <button
                  onClick={() => setIsDarkMode(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                    isDarkMode
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <MdDarkMode size={20} />
                  Dark
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
