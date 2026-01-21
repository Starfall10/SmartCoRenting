import React from "react";
import { FaRegUser } from "react-icons/fa";
import { ViewType } from "@/types";

interface MessageHubPageProps {
  setActiveView: (view: ViewType) => void;
  setSelectedMessageUser: (user: string) => void;
  isDarkMode: boolean;
}

const MessageHubPage: React.FC<MessageHubPageProps> = ({
  setActiveView,
  setSelectedMessageUser,
  isDarkMode,
}) => {
  const messages = [
    {
      id: 1,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
    {
      id: 2,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
    {
      id: 3,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
    {
      id: 4,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
    {
      id: 5,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
    {
      id: 6,
      name: "Ara Mora",
      message: "Great, see you later!",
      time: "1 min ago",
    },
  ];

  const handleMessageClick = (name: string) => {
    setSelectedMessageUser(name);
    setActiveView("messageIndividual");
  };

  return (
    <div
      className={`min-h-screen pb-24 ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="p-6">
        <h2
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          MessagesHub
        </h2>
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search..."
            className={`w-full rounded-xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              isDarkMode
                ? "bg-zinc-900 text-white placeholder-gray-500"
                : "bg-gray-100 text-black placeholder-gray-400 border border-gray-300"
            }`}
          />
          <svg
            className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
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

      {/* Message List */}
      <div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => handleMessageClick(msg.name)}
            className={`flex items-center px-6 py-4 cursor-pointer border-b ${
              isDarkMode
                ? "hover:bg-zinc-900 border-zinc-900"
                : "hover:bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`rounded-full p-3 mr-4 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
            >
              <FaRegUser
                className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                size={24}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{msg.name}</h3>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {msg.message}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-xs mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                {msg.time}
              </span>
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageHubPage;
