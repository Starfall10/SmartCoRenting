import React from "react";
import { ViewType, UserData } from "@/types";

interface HomePageProps {
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
  currentUser: UserData | null;
}

const HomePage: React.FC<HomePageProps> = ({
  setActiveView,
  isDarkMode,
  currentUser,
}) => {
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!currentUser) return { step: 0, percentage: 0 };

    let completedFields = 0;
    const totalFields = 10;

    if (currentUser.fullName) completedFields++;
    if (currentUser.gender) completedFields++;
    if (currentUser.age) completedFields++;
    if (currentUser.preferredLocation) completedFields++;
    if (currentUser.moveInDate) completedFields++;
    if (currentUser.lengthOfStay) completedFields++;
    if (currentUser.monthlyBudget) completedFields++;
    if (currentUser.genderPreference) completedFields++;
    if (currentUser.propertyType) completedFields++;
    if (currentUser.bio) completedFields++;

    return {
      step: completedFields,
      percentage: (completedFields / totalFields) * 100,
    };
  };

  const { step, percentage } = calculateProfileCompletion();
  const displayName =
    currentUser?.fullName || currentUser?.displayName || "User";

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
        <h1 className="text-3xl font-bold mb-2">Hi {displayName}</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Let&apos;s find the right people to live with
        </p>
      </div>

      {/* Profile Creation Card - Only show if profile is incomplete */}
      {!currentUser?.profileComplete && (
        <div
          className={`rounded-2xl p-6 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-2">Profile Creation</h3>
          <p
            className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Step {step} of 10
          </p>

          <div
            className={`w-full rounded-full h-2 mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
          >
            <div
              className={`rounded-full h-2 ${isDarkMode ? "bg-white" : "bg-indigo-600"}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <button
            onClick={() => setActiveView("addprofile")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-full transition-colors"
          >
            Continue setting up your profile
          </button>
        </div>
      )}

      {/* Profile Complete Card */}
      {currentUser?.profileComplete && (
        <div
          className={`rounded-2xl p-6 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-2">Profile Complete! ✓</h3>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            You&apos;re all set up and ready to find roommates
          </p>
        </div>
      )}

      {/* Matches Card */}
      <div
        className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        {currentUser?.profileComplete ? (
          <>
            <h3 className="text-lg font-semibold mb-1">Find Matches</h3>
            <p
              className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Start swiping to find compatible roommates
            </p>
            <button
              onClick={() => setActiveView("match")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-full transition-colors"
            >
              Start Matching
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-1">No Matches yet</h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Finish setting up your profile to start matching
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
