import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";

interface MatchMakingPageProps {
  isDarkMode: boolean;
}

type MatchStage = "initial" | "found" | "profile";

const MatchMakingPage: React.FC<MatchMakingPageProps> = ({ isDarkMode }) => {
  const [stage, setStage] = useState<MatchStage>("initial");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const matches = [
    { id: 1, name: "Ana Mora", score: 90 },
    { id: 2, name: "Ana Mora", score: 90 },
    { id: 3, name: "Ana Mora", score: 90 },
  ];

  const handleFindRoommate = () => {
    setStage("found");
  };

  const handleSeeProfile = (match: any) => {
    setSelectedProfile(match);
    setStage("profile");
  };

  const handleBack = () => {
    if (stage === "profile") {
      setStage("found");
    } else {
      setStage("initial");
    }
  };

  if (stage === "initial") {
    return (
      <div
        className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <h2
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Find a Roommate
        </h2>

        <h1 className="text-3xl font-bold mb-12">Find a Roommate</h1>

        <div className="flex flex-col items-center justify-center mt-32">
          <div className="mb-8">
            <FaUserPlus size={100} />
          </div>

          <button
            onClick={handleFindRoommate}
            className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full transition-colors"
          >
            Find a Roommate
          </button>
        </div>
      </div>
    );
  }

  if (stage === "found") {
    return (
      <div
        className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <h2
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Matches
        </h2>

        <h1 className="text-3xl font-bold mb-8">Roommates Found</h1>

        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`rounded-2xl p-6 flex items-center gap-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
              >
                🐻
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{match.name}</h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Matched Score
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  {match.score}%
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                  CHAT
                </button>
                <button
                  onClick={() => handleSeeProfile(match)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-black"
                  }`}
                >
                  See Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Profile stage
  return (
    <div
      className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <h2
        className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Matched
      </h2>

      <h1 className="text-3xl font-bold mb-2">Roommate Found</h1>
      <p
        className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        Matched Score: 90%
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
        >
          🐻
        </div>
        <div>
          <h2 className="text-2xl font-bold">Winston Harold</h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Age: 24
          </p>
        </div>
      </div>

      {/* Life Style */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Life Style</h3>
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

      {/* Hard Constraints */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Hard Constraints</h3>
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

      {/* About */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">About</h3>
        <p
          className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially including versions of Lorem Ipsum.
        </p>
      </div>

      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full mb-4 transition-colors">
        Start Conversation
      </button>

      <button
        onClick={handleBack}
        className={`w-full font-medium py-4 rounded-full transition-colors ${
          isDarkMode
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-black"
        }`}
      >
        See Matched Reasoning
      </button>
    </div>
  );
};

export default MatchMakingPage;
