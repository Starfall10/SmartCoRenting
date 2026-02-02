import React, { useState } from "react";
import { FaCog, FaEdit, FaTimes, FaCheck, FaPlus } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { ViewType, UserData } from "@/types";
import {
  updateLifestyleTags,
  updateConstraintTags,
  updateBio,
} from "@/lib/firebase/user";
import { signOutUser } from "@/lib/firebase/auth";

interface ProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
}

const LIFESTYLE_OPTIONS = [
  "Night Owl",
  "Early Bird",
  "Very Tidy",
  "Relaxed Clean",
  "Quiet Home",
  "Social",
  "Works from Home",
  "Pet Friendly",
  "Fitness Enthusiast",
  "Homebody",
  "Traveler",
  "Foodie",
];

const CONSTRAINT_OPTIONS = [
  "Zone 1",
  "Zone 2",
  "Zone 3",
  "Zone 4",
  "Short-Term",
  "Long-Term",
  "Male Only",
  "Female Only",
  "No Smoking",
  "No Pets",
  "Vegetarian Kitchen",
  "Flexible Schedule",
];

const ProfilePage: React.FC<ProfilePageProps> = ({
  setActiveView,
  isDarkMode,
  setIsDarkMode,
  currentUser,
  setCurrentUser,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [editingLifestyle, setEditingLifestyle] = useState(false);
  const [editingConstraints, setEditingConstraints] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [lifestyleTags, setLifestyleTags] = useState<string[]>(
    currentUser?.lifestyleTags || [],
  );
  const [constraintTags, setConstraintTags] = useState<string[]>(
    currentUser?.constraintTags || [],
  );
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      await fetch("/api/auth/session", { method: "DELETE" });
      setCurrentUser(null);
      setShowSettings(false);
      setActiveView("login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTag = (
    tag: string,
    tags: string[],
    setTags: (tags: string[]) => void,
  ) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSaveLifestyle = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateLifestyleTags(currentUser.uid, lifestyleTags);
      setCurrentUser({ ...currentUser, lifestyleTags });
      setEditingLifestyle(false);
    } catch (error) {
      console.error("Error saving lifestyle tags:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConstraints = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateConstraintTags(currentUser.uid, constraintTags);
      setCurrentUser({ ...currentUser, constraintTags });
      setEditingConstraints(false);
    } catch (error) {
      console.error("Error saving constraint tags:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateBio(currentUser.uid, bio);
      setCurrentUser({ ...currentUser, bio });
      setEditingBio(false);
    } catch (error) {
      console.error("Error saving bio:", error);
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    currentUser?.fullName || currentUser?.displayName || "User";
  const displayAge = currentUser?.age || "N/A";

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
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Age: {displayAge}
          </p>
        </div>
      </div>

      {/* Life Style Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Life Style</h3>
          {editingLifestyle ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLifestyleTags(currentUser?.lifestyleTags || []);
                  setEditingLifestyle(false);
                }}
                className={`hover:opacity-70 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <FaTimes size={16} />
              </button>
              <button
                onClick={handleSaveLifestyle}
                disabled={saving}
                className="text-green-500 hover:opacity-70"
              >
                <FaCheck size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingLifestyle(true)}
              className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
            >
              <FaEdit size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editingLifestyle ? (
            LIFESTYLE_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag, lifestyleTags, setLifestyleTags)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  lifestyleTags.includes(tag)
                    ? "bg-indigo-600 text-white"
                    : isDarkMode
                      ? "bg-zinc-800 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {lifestyleTags.includes(tag) ? tag : `+ ${tag}`}
              </button>
            ))
          ) : lifestyleTags.length > 0 ? (
            lifestyleTags.map((tag) => (
              <span
                key={tag}
                className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <button
              onClick={() => setEditingLifestyle(true)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${isDarkMode ? "bg-zinc-800 text-gray-400" : "bg-gray-200 text-gray-600"}`}
            >
              <FaPlus size={12} /> Add lifestyle tags
            </button>
          )}
        </div>
      </div>

      {/* Hard Constraints Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Hard Constraints</h3>
          {editingConstraints ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConstraintTags(currentUser?.constraintTags || []);
                  setEditingConstraints(false);
                }}
                className={`hover:opacity-70 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <FaTimes size={16} />
              </button>
              <button
                onClick={handleSaveConstraints}
                disabled={saving}
                className="text-green-500 hover:opacity-70"
              >
                <FaCheck size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingConstraints(true)}
              className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
            >
              <FaEdit size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editingConstraints ? (
            CONSTRAINT_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  toggleTag(tag, constraintTags, setConstraintTags)
                }
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  constraintTags.includes(tag)
                    ? "bg-indigo-600 text-white"
                    : isDarkMode
                      ? "bg-zinc-800 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {constraintTags.includes(tag) ? tag : `+ ${tag}`}
              </button>
            ))
          ) : constraintTags.length > 0 ? (
            constraintTags.map((tag) => (
              <span
                key={tag}
                className={`px-4 py-2 rounded-full text-sm ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <button
              onClick={() => setEditingConstraints(true)}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${isDarkMode ? "bg-zinc-800 text-gray-400" : "bg-gray-200 text-gray-600"}`}
            >
              <FaPlus size={12} /> Add constraint tags
            </button>
          )}
        </div>
      </div>

      {/* About Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">About</h3>
          {editingBio ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBio(currentUser?.bio || "");
                  setEditingBio(false);
                }}
                className={`hover:opacity-70 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <FaTimes size={16} />
              </button>
              <button
                onClick={handleSaveBio}
                disabled={saving}
                className="text-green-500 hover:opacity-70"
              >
                <FaCheck size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingBio(true)}
              className={`hover:opacity-70 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
            >
              <FaEdit size={16} />
            </button>
          )}
        </div>
        {editingBio ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself..."
            rows={5}
            className={`w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none ${
              isDarkMode
                ? "bg-zinc-800 text-white placeholder-gray-500"
                : "bg-gray-100 text-black placeholder-gray-400 border border-gray-300"
            }`}
          />
        ) : (
          <p
            className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {bio || "No bio yet. Click edit to add one!"}
          </p>
        )}
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
