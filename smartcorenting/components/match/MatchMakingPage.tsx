/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaArrowLeft,
  FaSpinner,
  FaSync,
  FaFilter,
} from "react-icons/fa";
import {
  ViewType,
  UserData,
  HardConstraintFilters,
  DEFAULT_HARD_CONSTRAINT_FILTERS,
} from "@/types";
import {
  MatchResult,
  SimilarityBreakdown,
  FACTOR_LABELS,
} from "@/lib/matchmaking/algorithm";

interface MatchMakingPageProps {
  isDarkMode: boolean;
  currentUser: UserData | null;
  setActiveView: (view: ViewType) => void;
  setSelectedConversationUser?: (
    user: { odid: string; name: string } | null,
  ) => void;
}

type MatchStage = "initial" | "loading" | "found" | "profile" | "reasoning";

const FILTER_LABELS: Record<keyof HardConstraintFilters, string> = {
  gender: "Gender Preference",
  budget: "Budget Range",
  location: "Location",
  moveInDate: "Move-in Date & Stay Duration",
  propertyType: "Property Type",
};

const MatchMakingPage: React.FC<MatchMakingPageProps> = ({
  isDarkMode,
  currentUser,
  setActiveView,
  setSelectedConversationUser,
}) => {
  const [stage, setStage] = useState<MatchStage>("loading");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [filters, setFilters] = useState<HardConstraintFilters>(
    DEFAULT_HARD_CONSTRAINT_FILTERS,
  );
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (key: keyof HardConstraintFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Load existing matches on mount
  useEffect(() => {
    const loadExistingMatches = async () => {
      if (!currentUser) {
        setStage("initial");
        return;
      }

      if (!currentUser.profileComplete) {
        setStage("initial");
        return;
      }

      try {
        const response = await fetch("/api/matches/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.uid, filters }),
        });

        const data = await response.json();

        if (data.success && data.matches.length > 0) {
          setMatches(data.matches);
          setStage("found");
        } else {
          setStage("initial");
        }
      } catch (err) {
        setStage("initial");
      }
    };

    loadExistingMatches();
  }, [currentUser]);

  const handleFindRoommate = async (forceRefresh: boolean = false) => {
    if (!currentUser) {
      setError("Please log in to find matches");
      return;
    }

    if (!currentUser.profileComplete) {
      setError("Please complete your profile before finding matches");
      return;
    }

    if (forceRefresh) {
      setIsRecalculating(true);
    } else {
      setStage("loading");
    }
    setError(null);

    try {
      const response = await fetch("/api/matches/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          forceRefresh,
          filters,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        if (!forceRefresh) setStage("initial");
        return;
      }

      setMatches(data.matches);
      setStage("found");
    } catch (err) {
      setError("Failed to find matches. Please try again.");
      if (!forceRefresh) setStage("initial");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRecalculate = () => {
    handleFindRoommate(true);
  };

  const handleSeeProfile = (match: MatchResult) => {
    setSelectedMatch(match);
    setStage("profile");
  };

  const handleSeeReasoning = () => {
    setStage("reasoning");
  };

  const handleStartConversation = (match: MatchResult) => {
    if (setSelectedConversationUser) {
      setSelectedConversationUser({
        odid: match.candidateId,
        name: match.candidateData.displayName,
      });
    }
    setActiveView("messageIndividual");
  };

  const handleBack = () => {
    if (stage === "reasoning") {
      setStage("profile");
    } else if (stage === "profile") {
      setStage("found");
    } else {
      setStage("initial");
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500";
    if (score >= 65) return "text-indigo-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getSimilarityBarWidth = (value: number): string => {
    return `${value * 100}%`;
  };

  // Initial stage - Find Roommate button
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

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-8">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}

        {!currentUser?.profileComplete ? (
          <div className="flex flex-col items-center justify-center mt-32">
            <div className="mb-8">
              <FaUserPlus
                size={100}
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
              />
            </div>
            <div
              className={`text-center mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <p className="text-lg mb-2">Complete your profile first</p>
              <p className="text-sm">
                You need to complete your profile before finding roommates
              </p>
            </div>
            <button
              onClick={() => setActiveView("addprofile")}
              className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full transition-colors"
            >
              Complete Profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Filter Toggle */}
            <div className="w-full max-w-sm mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaFilter className="text-indigo-500" />
                  <span>Match Filters</span>
                </div>
                <span
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {Object.values(filters).filter(Boolean).length}/5 active
                </span>
              </button>

              {/* Filter Options */}
              {showFilters && (
                <div
                  className={`mt-3 p-4 rounded-xl ${
                    isDarkMode ? "bg-zinc-800" : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Enable filters to only show matches that meet these
                    criteria:
                  </p>
                  <div className="space-y-3">
                    {(
                      Object.keys(filters) as Array<keyof HardConstraintFilters>
                    ).map((key) => (
                      <label
                        key={key}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-sm">{FILTER_LABELS[key]}</span>
                        <button
                          onClick={() => toggleFilter(key)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            filters[key] ? "bg-indigo-600" : "bg-zinc-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              filters[key] ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <FaUserPlus
                size={100}
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
              />
            </div>

            <button
              onClick={() => handleFindRoommate()}
              className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full transition-colors"
            >
              Find a Roommate
            </button>
          </div>
        )}
      </div>
    );
  }

  // Loading stage
  if (stage === "loading") {
    return (
      <div
        className={`min-h-screen p-6 pb-24 flex flex-col items-center justify-center ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <FaSpinner className="animate-spin text-indigo-600 text-6xl mb-4" />
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Finding compatible roommates...
        </p>
      </div>
    );
  }

  // Matches found stage
  if (stage === "found") {
    return (
      <div
        className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Matches
          </h2>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isDarkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-black"
            } ${isRecalculating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FaSync
              className={`text-xs ${isRecalculating ? "animate-spin" : ""}`}
            />
            {isRecalculating ? "Recalculating..." : "Recalculate"}
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Roommates Found</h1>
        <p
          className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          {matches.length} compatible{" "}
          {matches.length === 1 ? "match" : "matches"} found
        </p>

        {/* Filter controls */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} transition-colors`}
          >
            <FaFilter className="text-xs" />
            {showFilters ? "Hide Filters" : "Adjust Filters"}
          </button>

          {showFilters && (
            <div
              className={`mt-3 p-4 rounded-xl ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
            >
              <p
                className={`text-xs mb-3 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                Toggle filters and recalculate to update results
              </p>
              <div className="space-y-2">
                {(
                  Object.keys(filters) as Array<keyof HardConstraintFilters>
                ).map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <span
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {FILTER_LABELS[key]}
                    </span>
                    <button
                      onClick={() => toggleFilter(key)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        filters[key]
                          ? "bg-indigo-600"
                          : isDarkMode
                            ? "bg-zinc-700"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          filters[key] ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p
              className={`text-lg mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              No compatible matches found
            </p>
            <p
              className={`text-sm text-center mb-8 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
            >
              Try adjusting your preferences or check back later for new users
            </p>
            <button
              onClick={() => setStage("initial")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
            >
              Search Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.candidateId}
                className={`rounded-2xl p-6 flex items-center gap-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
                >
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate">
                    {match.candidateData.displayName}
                  </h3>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {match.candidateData.preferredLocation ||
                      "Location not specified"}
                  </p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(match.compatibilityScore)}`}
                  >
                    {match.compatibilityScore}%
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleStartConversation(match)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    CHAT
                  </button>
                  <button
                    onClick={() => handleSeeProfile(match)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-black"
                    }`}
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Profile view stage
  if (stage === "profile" && selectedMatch) {
    return (
      <div
        className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          <FaArrowLeft /> Back to matches
        </button>

        <h1 className="text-3xl font-bold mb-2">Match Profile</h1>
        <p
          className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Compatibility Score:{" "}
          <span
            className={`font-bold ${getScoreColor(selectedMatch.compatibilityScore)}`}
          >
            {selectedMatch.compatibilityScore}%
          </span>
        </p>

        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
          >
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {selectedMatch.candidateData.displayName}
            </h2>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              {selectedMatch.candidateData.gender || "Gender not specified"}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div
          className={`rounded-2xl p-4 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-3">Preferences</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Location
              </span>
              <p className="font-medium">
                {selectedMatch.candidateData.preferredLocation || "—"}
              </p>
            </div>
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Budget
              </span>
              <p className="font-medium">
                {selectedMatch.candidateData.monthlyBudget || "—"}
              </p>
            </div>
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Move-in
              </span>
              <p className="font-medium">
                {selectedMatch.candidateData.moveInDate || "—"}
              </p>
            </div>
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Stay Length
              </span>
              <p className="font-medium">
                {selectedMatch.candidateData.lengthOfStay || "—"}
              </p>
            </div>
            <div>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Property
              </span>
              <p className="font-medium">
                {selectedMatch.candidateData.propertyType || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Compatibility Summary */}
        <div
          className={`rounded-2xl p-4 mb-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-3">Compatibility Summary</h3>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            {selectedMatch.explanation.summary}
          </p>

          {selectedMatch.explanation.strongFactors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-green-500 font-medium mb-2">
                Strong Matches:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.explanation.strongFactors.map((factor) => (
                  <span
                    key={factor}
                    className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedMatch.explanation.weakFactors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-yellow-500 font-medium mb-2">
                Areas to Discuss:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.explanation.weakFactors.map((factor) => (
                  <span
                    key={factor}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => handleStartConversation(selectedMatch)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-full mb-4 transition-colors"
        >
          Start Conversation
        </button>

        <button
          onClick={handleSeeReasoning}
          className={`w-full font-medium py-4 rounded-full transition-colors ${
            isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
        >
          See Detailed Analysis
        </button>
      </div>
    );
  }

  // Reasoning/Detailed Analysis stage
  if (stage === "reasoning" && selectedMatch) {
    const breakdown = selectedMatch.similarityBreakdown;

    return (
      <div
        className={`min-h-screen p-6 pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          <FaArrowLeft /> Back to profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Detailed Analysis</h1>
        <p
          className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Compatibility breakdown with {selectedMatch.candidateData.displayName}
        </p>

        {/* Overall Score */}
        <div
          className={`rounded-2xl p-6 mb-6 text-center ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <p
            className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Overall Compatibility
          </p>
          <p
            className={`text-5xl font-bold ${getScoreColor(selectedMatch.compatibilityScore)}`}
          >
            {selectedMatch.compatibilityScore}%
          </p>
        </div>

        {/* Full Explanation */}
        <div
          className={`rounded-2xl p-4 mb-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <p
            className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            {selectedMatch.explanation.fullMessage}
          </p>
        </div>

        {/* Factor Breakdown */}
        <div
          className={`rounded-2xl p-4 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-lg font-semibold mb-4">Factor Breakdown</h3>
          <div className="space-y-4">
            {(
              Object.entries(breakdown) as [keyof SimilarityBreakdown, number][]
            ).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm capitalize">
                    {FACTOR_LABELS[key]}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      value >= 0.75
                        ? "text-green-500"
                        : value >= 0.5
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div
                  className={`h-2 rounded-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}`}
                >
                  <div
                    className={`h-full rounded-full ${
                      value >= 0.75
                        ? "bg-green-500"
                        : value >= 0.5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: getSimilarityBarWidth(value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className={`text-xs text-center mt-6 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          Algorithm version: {selectedMatch.algorithmVersion}
        </p>
      </div>
    );
  }

  return null;
};

export default MatchMakingPage;
