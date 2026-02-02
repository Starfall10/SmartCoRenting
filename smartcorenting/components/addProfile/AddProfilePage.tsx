import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { ViewType, UserData } from "@/types";
import { updateUserProfile, updateProfileStep } from "@/lib/firebase/user";

interface AddProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
}

const AddProfilePage: React.FC<AddProfilePageProps> = ({
  setActiveView,
  isDarkMode,
  currentUser,
  setCurrentUser,
}) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 2; // Profile Creation and Hard Constraints

  // Form state for Step 1
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // Form state for Step 2
  const [preferredLocation, setPreferredLocation] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Initialize form with existing user data
  useEffect(() => {
    if (currentUser) {
      setStep(currentUser.profileStep || 1);
      setFullName(currentUser.fullName || "");
      setGender(currentUser.gender || "");
      setAge(currentUser.age?.toString() || "");
      setPreferredLocation(currentUser.preferredLocation || "");
      setMoveInDate(currentUser.moveInDate || "");
      setLengthOfStay(currentUser.lengthOfStay || "");
      setMonthlyBudget(currentUser.monthlyBudget || "");
      setGenderPreference(currentUser.genderPreference || "");
      setPropertyType(currentUser.propertyType || "");
    }
  }, [currentUser]);

  const handleSaveAndContinue = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      if (step === 1) {
        // Save step 1 data
        await updateUserProfile(currentUser.uid, {
          fullName,
          gender,
          age: age ? parseInt(age) : undefined,
        });
        await updateProfileStep(currentUser.uid, 2);

        // Update local state
        setCurrentUser({
          ...currentUser,
          fullName,
          gender,
          age: age ? parseInt(age) : undefined,
          profileStep: 2,
        });

        setStep(2);
      } else if (step === 2) {
        // Save step 2 data and mark profile as complete
        await updateUserProfile(currentUser.uid, {
          preferredLocation,
          moveInDate,
          lengthOfStay,
          monthlyBudget,
          genderPreference,
          propertyType,
          profileComplete: true,
        });
        await updateProfileStep(currentUser.uid, 2, true);

        // Update local state
        setCurrentUser({
          ...currentUser,
          preferredLocation,
          moveInDate,
          lengthOfStay,
          monthlyBudget,
          genderPreference,
          propertyType,
          profileComplete: true,
          profileStep: 2,
        });

        setActiveView("home");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!currentUser) {
      setActiveView("home");
      return;
    }

    // Save current step progress before skipping
    try {
      await updateProfileStep(currentUser.uid, step);
    } catch (error) {
      console.error("Error saving step:", error);
    }

    setActiveView("home");
  };

  return (
    <div
      className={`min-h-screen p-6 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="flex justify-between items-center mb-6">
        <p
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Add Profile Details
        </p>
        <button
          onClick={handleSkip}
          className={`text-sm font-medium ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
        >
          Skip for now
        </button>
      </div>

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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Age</option>
              {Array.from({ length: 63 }, (_, i) => i + 18).map((ageVal) => (
                <option key={ageVal} value={ageVal}>
                  {ageVal}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveAndContinue}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-full mt-6 transition-colors"
          >
            {saving ? "Saving..." : "Continue"}
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
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
            />

            <select
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Move in date range</option>
              <option value="Immediately">Immediately</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="Within 3 months">Within 3 months</option>
              <option value="Within 6 months">Within 6 months</option>
            </select>

            <select
              value={lengthOfStay}
              onChange={(e) => setLengthOfStay(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Length of stay</option>
              <option value="Short-term (1-6 months)">
                Short-term (1-6 months)
              </option>
              <option value="Medium-term (6-12 months)">
                Medium-term (6-12 months)
              </option>
              <option value="Long-term (12+ months)">
                Long-term (12+ months)
              </option>
            </select>

            <select
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Monthly Budget</option>
              <option value="£500-£800">£500-£800</option>
              <option value="£800-£1200">£800-£1200</option>
              <option value="£1200-£1500">£1200-£1500</option>
              <option value="£1500+">£1500+</option>
            </select>

            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Gender Preference (optional)</option>
              <option value="Male Only">Male Only</option>
              <option value="Female Only">Female Only</option>
              <option value="No Preference">No Preference</option>
            </select>

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
                isDarkMode
                  ? "bg-black border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value="">Property Type (optional)</option>
              <option value="Flat">Flat</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
              <option value="Shared Room">Shared Room</option>
            </select>
          </div>

          <button
            onClick={handleSaveAndContinue}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-full mt-6 transition-colors"
          >
            {saving ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProfilePage;
