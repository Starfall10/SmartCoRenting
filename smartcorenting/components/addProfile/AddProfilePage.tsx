import React, { useState, useEffect } from "react";
import { ViewType, UserData } from "@/types";
import { updateUserProfile, updateProfileStep } from "@/lib/firebase/user";

interface AddProfilePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
}

// Slider preference configuration
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

const AddProfilePage: React.FC<AddProfilePageProps> = ({
  setActiveView,
  isDarkMode,
  currentUser,
  setCurrentUser,
}) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 3;

  // Form state for Step 1 - Basic Info
  const [gender, setGender] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Form state for Step 2 - Yes/No Preferences
  const [smoking, setSmoking] = useState<boolean | null>(null);
  const [pets, setPets] = useState<boolean | null>(null);

  // Form state for Step 3 - Lifestyle Preferences (1-5 scale)
  const [sliderValues, setSliderValues] = useState<Record<SliderKey, number>>({
    sleepSchedule: 3,
    cleanliness: 3,
    noiseTolerance: 3,
    workHabits: 3,
    socialLifestyle: 3,
    guestFrequency: 3,
    cookingFrequency: 3,
    personalSpace: 3,
    activityLevel: 3,
  });

  // Initialize form with existing user data
  useEffect(() => {
    if (currentUser) {
      setStep(currentUser.profileStep || 1);
      setGender(currentUser.gender || "");
      setGenderPreference(currentUser.genderPreference || "");
      setMonthlyBudget(currentUser.monthlyBudget || "");
      setPreferredLocation(currentUser.preferredLocation || "");
      setMoveInDate(currentUser.moveInDate || "");
      setLengthOfStay(currentUser.lengthOfStay || "");
      setPropertyType(currentUser.propertyType || "");
      setSmoking(currentUser.smoking ?? null);
      setPets(currentUser.pets ?? null);

      // Initialize slider values from user data
      setSliderValues({
        sleepSchedule: currentUser.sleepSchedule ?? 3,
        cleanliness: currentUser.cleanliness ?? 3,
        noiseTolerance: currentUser.noiseTolerance ?? 3,
        workHabits: currentUser.workHabits ?? 3,
        socialLifestyle: currentUser.socialLifestyle ?? 3,
        guestFrequency: currentUser.guestFrequency ?? 3,
        cookingFrequency: currentUser.cookingFrequency ?? 3,
        personalSpace: currentUser.personalSpace ?? 3,
        activityLevel: currentUser.activityLevel ?? 3,
      });
    }
  }, [currentUser]);

  const handleSliderChange = (key: SliderKey, value: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAndContinue = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      if (step === 1) {
        await updateUserProfile(currentUser.uid, {
          gender,
          genderPreference,
          monthlyBudget,
          preferredLocation,
          moveInDate,
          lengthOfStay,
          propertyType,
        });
        await updateProfileStep(currentUser.uid, 2);

        setCurrentUser({
          ...currentUser,
          gender,
          genderPreference,
          monthlyBudget,
          preferredLocation,
          moveInDate,
          lengthOfStay,
          propertyType,
          profileStep: 2,
        });

        setStep(2);
      } else if (step === 2) {
        await updateUserProfile(currentUser.uid, {
          smoking: smoking ?? false,
          pets: pets ?? false,
        });
        await updateProfileStep(currentUser.uid, 3);

        setCurrentUser({
          ...currentUser,
          smoking: smoking ?? false,
          pets: pets ?? false,
          profileStep: 3,
        });

        setStep(3);
      } else if (step === 3) {
        await updateUserProfile(currentUser.uid, {
          ...sliderValues,
          profileComplete: true,
        });
        await updateProfileStep(currentUser.uid, 3, true);

        setCurrentUser({
          ...currentUser,
          ...sliderValues,
          profileComplete: true,
          profileStep: 3,
        });

        setActiveView("home");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    if (!currentUser) {
      setActiveView("home");
      return;
    }

    try {
      await updateProfileStep(currentUser.uid, step);
    } catch (error) {
      console.error("Error saving step:", error);
    }

    setActiveView("home");
  };

  const selectClasses = `w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
    isDarkMode
      ? "bg-black border-zinc-700 text-white"
      : "bg-white border-gray-300 text-black"
  }`;

  const inputClasses = `w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-indigo-600 ${
    isDarkMode
      ? "bg-black border-zinc-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-black placeholder-gray-400"
  }`;

  return (
    <div
      className={`min-h-screen p-6 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="flex justify-between items-center mb-6">
        <p
          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Step {step} of {totalSteps}
        </p>
        <button
          onClick={handleSkip}
          className={`text-sm font-medium ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
        >
          Skip for now
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < step
                ? "bg-indigo-600"
                : isDarkMode
                  ? "bg-zinc-700"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-2">Add Profile Details</h1>
      <p
        className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        These details help us find matches that fit your
        <br />
        budget, location, and living needs
      </p>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h2 className="text-xl font-bold mb-6">Basic Information</h2>

          <div className="space-y-4">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={selectClasses}
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>

            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className={selectClasses}
            >
              <option value="">Roommate Gender Preference</option>
              <option value="Male Only">Male Only</option>
              <option value="Female Only">Female Only</option>
              <option value="No Preference">No Preference</option>
            </select>

            <select
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className={selectClasses}
            >
              <option value="">Monthly Budget</option>
              <option value="£500-£800">£500-£800</option>
              <option value="£800-£1200">£800-£1200</option>
              <option value="£1200-£1500">£1200-£1500</option>
              <option value="£1500+">£1500+</option>
            </select>

            <input
              type="text"
              placeholder="Preferred Location (e.g., London, Manchester)"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className={inputClasses}
            />

            <select
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className={selectClasses}
            >
              <option value="">Move-in Date</option>
              <option value="Immediately">Immediately</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="Within 3 months">Within 3 months</option>
              <option value="Within 6 months">Within 6 months</option>
              <option value="Flexible">Flexible</option>
            </select>

            <select
              value={lengthOfStay}
              onChange={(e) => setLengthOfStay(e.target.value)}
              className={selectClasses}
            >
              <option value="">Length of Stay</option>
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
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={selectClasses}
            >
              <option value="">Property Type</option>
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
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      )}

      {/* Step 2: Yes/No Preferences */}
      {step === 2 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h2 className="text-xl font-bold mb-6">Living Preferences</h2>

          <div className="space-y-6">
            {/* Smoking */}
            <div>
              <p className="font-medium mb-3">Do you smoke?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSmoking(true)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    smoking === true
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setSmoking(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    smoking === false
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Pets */}
            <div>
              <p className="font-medium mb-3">
                Do you have pets or are okay with pets?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPets(true)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    pets === true
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setPets(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    pets === false
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBack}
              className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-full transition-colors"
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Lifestyle Preferences (1-5 Scale) */}
      {step === 3 && (
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h2 className="text-xl font-bold mb-2">Lifestyle Preferences</h2>
          <p
            className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Move the sliders to indicate your preferences
          </p>

          <div className="space-y-6">
            {sliderPreferences.map((pref) => (
              <div key={pref.key}>
                <p className="font-medium mb-2">{pref.label}</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs w-24 text-left ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {pref.left}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={sliderValues[pref.key]}
                      onChange={(e) =>
                        handleSliderChange(pref.key, parseInt(e.target.value))
                      }
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      style={{
                        background: isDarkMode
                          ? `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(sliderValues[pref.key] - 1) * 25}%, #3f3f46 ${(sliderValues[pref.key] - 1) * 25}%, #3f3f46 100%)`
                          : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(sliderValues[pref.key] - 1) * 25}%, #d1d5db ${(sliderValues[pref.key] - 1) * 25}%, #d1d5db 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          className={`text-xs ${
                            sliderValues[pref.key] === num
                              ? "text-indigo-600 font-bold"
                              : isDarkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-xs w-24 text-right ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {pref.right}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBack}
              className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 rounded-full transition-colors"
            >
              {saving ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProfilePage;
