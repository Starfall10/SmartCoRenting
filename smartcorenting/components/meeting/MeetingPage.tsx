import React from "react";
import MapComponent from "./MapComponent";

interface MeetingPageProps {
  isDarkMode: boolean;
}

const MeetingPage: React.FC<MeetingPageProps> = ({ isDarkMode }) => {
  return (
    <div
      className={`min-h-screen pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="p-6">
        <h2
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          MeetinPlan
        </h2>
        <h1 className="text-3xl font-bold mb-6">Plan a Meeting</h1>
      </div>

      {/* Map Area */}
      <div className="relative h-80 bg-gray-300 mb-6">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <MapComponent />
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Location or Postcode"
              className="w-full bg-white text-black rounded-xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="px-6">
        <div
          className={`rounded-2xl p-6 ${isDarkMode ? "bg-zinc-900" : "bg-gray-100"}`}
        >
          <h3 className="text-xl font-bold mb-2">The Cafe Shop</h3>

          <div className="flex items-center mb-4">
            <span
              className={`text-sm mr-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Rating 3/5
            </span>
            <div className="flex">
              {[1, 2, 3].map((star) => (
                <span key={star} className="text-yellow-500">
                  ★
                </span>
              ))}
              {[4, 5].map((star) => (
                <span
                  key={star}
                  className={isDarkMode ? "text-gray-600" : "text-gray-400"}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">
              Share Location
            </button>
            <button
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              Copy Address
            </button>
          </div>

          <p
            className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived
            not only five centuries, but also the leap into electronic
            typesetting, remaining essentially unchanged Lorem Ipsum.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
