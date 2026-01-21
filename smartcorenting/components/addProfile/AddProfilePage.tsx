import React, { useState } from "react";
import { FaCamera } from "react-icons/fa";
import { ViewType } from "@/types";

interface AddProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const AddProfilePage: React.FC<AddProfilePageProps> = ({
  setActiveView,
  isDarkMode,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 2; // Profile Creation and Hard Constraints

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setActiveView("home");
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <p
        className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Add Profile Details
      </p>

      <h1 className="text-3xl font-bold mb-2">Add Profile Details</h1>
      <p
        className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        These details help us find matches that fit your
        <br />
        budget, location, and living needs
      </p>

      {step === 1 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h2 className="text-xl font-bold mb-6">Profile Creation</h2>

          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <FaCamera size={40} className="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
            />

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Age</option>
              {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                <option key={age}>{age}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-full mt-6 transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h2 className="text-xl font-bold mb-6">Hard Constraints</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Preferred location"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
            />

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Move in date range</option>
              <option>Immediately</option>
              <option>Within 1 month</option>
              <option>Within 3 months</option>
              <option>Within 6 months</option>
            </select>

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Length of stay</option>
              <option>Short-term (1-6 months)</option>
              <option>Medium-term (6-12 months)</option>
              <option>Long-term (12+ months)</option>
            </select>

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Monthly Budget</option>
              <option>£500-£800</option>
              <option>£800-£1200</option>
              <option>£1200-£1500</option>
              <option>£1500+</option>
            </select>

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Gender Preference (optional)</option>
              <option>Male Only</option>
              <option>Female Only</option>
              <option>No Preference</option>
            </select>

            <select
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option>Property Type (optional)</option>
              <option>Flat</option>
              <option>House</option>
              <option>Studio</option>
              <option>Shared Room</option>
            </select>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-full mt-6 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProfilePage;
