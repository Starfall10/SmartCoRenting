import React, { useState } from "react";
import { FaCog, FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { ViewType, UserData } from "@/types";
import { updateUserProfile } from "@/lib/firebase/user";
import { signOutUser } from "@/lib/firebase/auth";

interface ProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
}

// Slider preference configuration (same as AddProfilePage)
const sliderPreferences = [
  {
    key: "sleepSchedule",
    label: "Sleep schedule",
    left: "Early sleeper",
    right: "Night owl",
  },
  {
    key: "cleanliness",
    label: "Cleanliness",
    left: "Relaxed cleanliness",
    right: "Very tidy",
  },
  {
    key: "noiseTolerance",
    label: "Noise tolerance",
    left: "Need quiet",
    right: "Noise tolerant",
  },
  {
    key: "workHabits",
    label: "Study/work habits",
    left: "Rarely home",
    right: "Mostly home",
  },
  {
    key: "socialLifestyle",
    label: "Social lifestyle",
    left: "Private",
    right: "Very social",
  },
  {
    key: "guestFrequency",
    label: "Guest frequency",
    left: "No guests",
    right: "Frequent guests",
  },
  {
    key: "cookingFrequency",
    label: "Cooking frequency",
    left: "Rarely cook",
    right: "Cook daily",
  },
  {
    key: "personalSpace",
    label: "Personal space",
    left: "Independent",
    right: "Shared/social",
  },
  {
    key: "activityLevel",
    label: "Activity level",
    left: "Quiet lifestyle",
    right: "Lively household",
  },
] as const;

type SliderKey = (typeof sliderPreferences)[number]["key"];

const ProfilePage: React.FC<ProfilePageProps> = ({
  setActiveView,
  isDarkMode,
  setIsDarkMode,
  currentUser,
  setCurrentUser,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    gender: currentUser?.gender || "",
    genderPreference: currentUser?.genderPreference || "",
    monthlyBudget: currentUser?.monthlyBudget || "",
    preferredLocation: currentUser?.preferredLocation || "",
    moveInDate: currentUser?.moveInDate || "",
    lengthOfStay: currentUser?.lengthOfStay || "",
    propertyType: currentUser?.propertyType || "",
    smoking: currentUser?.smoking ?? false,
    pets: currentUser?.pets ?? false,
    sleepSchedule: currentUser?.sleepSchedule ?? 3,
    cleanliness: currentUser?.cleanliness ?? 3,
    noiseTolerance: currentUser?.noiseTolerance ?? 3,
    workHabits: currentUser?.workHabits ?? 3,
    socialLifestyle: currentUser?.socialLifestyle ?? 3,
    guestFrequency: currentUser?.guestFrequency ?? 3,
    cookingFrequency: currentUser?.cookingFrequency ?? 3,
    personalSpace: currentUser?.personalSpace ?? 3,
    activityLevel: currentUser?.activityLevel ?? 3,
  });

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

  const handleStartEdit = () => {
    setEditData({
      gender: currentUser?.gender || "",
      genderPreference: currentUser?.genderPreference || "",
      monthlyBudget: currentUser?.monthlyBudget || "",
      preferredLocation: currentUser?.preferredLocation || "",
      moveInDate: currentUser?.moveInDate || "",
      lengthOfStay: currentUser?.lengthOfStay || "",
      propertyType: currentUser?.propertyType || "",
      smoking: currentUser?.smoking ?? false,
      pets: currentUser?.pets ?? false,
      sleepSchedule: currentUser?.sleepSchedule ?? 3,
      cleanliness: currentUser?.cleanliness ?? 3,
      noiseTolerance: currentUser?.noiseTolerance ?? 3,
      workHabits: currentUser?.workHabits ?? 3,
      socialLifestyle: currentUser?.socialLifestyle ?? 3,
      guestFrequency: currentUser?.guestFrequency ?? 3,
      cookingFrequency: currentUser?.cookingFrequency ?? 3,
      personalSpace: currentUser?.personalSpace ?? 3,
      activityLevel: currentUser?.activityLevel ?? 3,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, editData);
      setCurrentUser({ ...currentUser, ...editData });
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const displayName = currentUser?.displayName || "User";

  const selectClasses = `w-full px-3 py-2 rounded-lg text-sm ${
    isDarkMode
      ? "bg-zinc-800 border-zinc-700 text-white"
      : "bg-white border-gray-300 text-black"
  } border`;

  const getSliderLabel = (key: SliderKey, value: number) => {
    const pref = sliderPreferences.find((p) => p.key === key);
    if (!pref) return "";
    if (value <= 2) return pref.left;
    if (value >= 4) return pref.right;
    return "Balanced";
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className={`p-2 rounded-full ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
            >
              <FaTimes size={18} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 rounded-full text-green-500 hover:bg-green-500/10"
            >
              <FaCheck size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className={`p-2 rounded-full ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
          >
            <FaEdit size={18} />
          </button>
        )}
      </div>

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
            {currentUser?.email}
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
      <div
        className={`rounded-2xl p-4 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            label="Gender"
            value={currentUser?.gender}
            editing={editing}
            editComponent={
              <select
                value={editData.gender}
                onChange={(e) =>
                  setEditData({ ...editData, gender: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Preference"
            value={currentUser?.genderPreference}
            editing={editing}
            editComponent={
              <select
                value={editData.genderPreference}
                onChange={(e) =>
                  setEditData({ ...editData, genderPreference: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="Male Only">Male Only</option>
                <option value="Female Only">Female Only</option>
                <option value="No Preference">No Preference</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Budget"
            value={currentUser?.monthlyBudget}
            editing={editing}
            editComponent={
              <select
                value={editData.monthlyBudget}
                onChange={(e) =>
                  setEditData({ ...editData, monthlyBudget: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="£500-£800">£500-£800</option>
                <option value="£800-£1200">£800-£1200</option>
                <option value="£1200-£1500">£1200-£1500</option>
                <option value="£1500+">£1500+</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Location"
            value={currentUser?.preferredLocation}
            editing={editing}
            editComponent={
              <input
                type="text"
                value={editData.preferredLocation}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    preferredLocation: e.target.value,
                  })
                }
                className={selectClasses}
                placeholder="Location"
              />
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Move-in"
            value={currentUser?.moveInDate}
            editing={editing}
            editComponent={
              <select
                value={editData.moveInDate}
                onChange={(e) =>
                  setEditData({ ...editData, moveInDate: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="Immediately">Immediately</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="Within 3 months">Within 3 months</option>
                <option value="Within 6 months">Within 6 months</option>
                <option value="Flexible">Flexible</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Stay Length"
            value={currentUser?.lengthOfStay}
            editing={editing}
            editComponent={
              <select
                value={editData.lengthOfStay}
                onChange={(e) =>
                  setEditData({ ...editData, lengthOfStay: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="Short-term (1-6 months)">Short-term</option>
                <option value="Medium-term (6-12 months)">Medium-term</option>
                <option value="Long-term (12+ months)">Long-term</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
          <InfoItem
            label="Property"
            value={currentUser?.propertyType}
            editing={editing}
            editComponent={
              <select
                value={editData.propertyType}
                onChange={(e) =>
                  setEditData({ ...editData, propertyType: e.target.value })
                }
                className={selectClasses}
              >
                <option value="">Select</option>
                <option value="Flat">Flat</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            }
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Yes/No Preferences */}
      <div
        className={`rounded-2xl p-4 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <h3 className="text-lg font-semibold mb-4">Living Preferences</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p
              className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Smoking
            </p>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditData({ ...editData, smoking: true })}
                  className={`flex-1 py-1.5 rounded-lg text-sm ${
                    editData.smoking
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setEditData({ ...editData, smoking: false })}
                  className={`flex-1 py-1.5 rounded-lg text-sm ${
                    !editData.smoking
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <p className="font-medium">
                {currentUser?.smoking ? "Yes" : "No"}
              </p>
            )}
          </div>
          <div>
            <p
              className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Pets
            </p>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditData({ ...editData, pets: true })}
                  className={`flex-1 py-1.5 rounded-lg text-sm ${
                    editData.pets
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setEditData({ ...editData, pets: false })}
                  className={`flex-1 py-1.5 rounded-lg text-sm ${
                    !editData.pets
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <p className="font-medium">{currentUser?.pets ? "Yes" : "No"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences (Sliders) */}
      <div
        className={`rounded-2xl p-4 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <h3 className="text-lg font-semibold mb-4">Lifestyle Preferences</h3>
        <div className="space-y-4">
          {sliderPreferences.map((pref) => {
            const value = (currentUser?.[pref.key] as number | undefined) ?? 3;
            const editValue = editData[pref.key];
            return (
              <div key={pref.key}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{pref.label}</p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {editing
                      ? getSliderLabel(pref.key, editValue)
                      : getSliderLabel(pref.key, value)}
                  </p>
                </div>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs w-20 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {pref.left}
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editValue}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          [pref.key]: parseInt(e.target.value),
                        })
                      }
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      style={{
                        background: isDarkMode
                          ? `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(editValue - 1) * 25}%, #3f3f46 ${(editValue - 1) * 25}%, #3f3f46 100%)`
                          : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(editValue - 1) * 25}%, #d1d5db ${(editValue - 1) * 25}%, #d1d5db 100%)`,
                      }}
                    />
                    <span
                      className={`text-xs w-20 text-right ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {pref.right}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 h-2 rounded-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}`}
                    >
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${(value - 1) * 25}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs w-6 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {value}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

// Helper component for displaying info items
const InfoItem: React.FC<{
  label: string;
  value?: string;
  editing: boolean;
  editComponent: React.ReactNode;
  isDarkMode: boolean;
}> = ({ label, value, editing, editComponent, isDarkMode }) => (
  <div>
    <p
      className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
    >
      {label}
    </p>
    {editing ? editComponent : <p className="font-medium">{value || "—"}</p>}
  </div>
);

export default ProfilePage;
