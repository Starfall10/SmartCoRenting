import React, { useState } from "react";
import { FaArrowLeft, FaRegUser, FaPaperPlane } from "react-icons/fa";
import { ViewType } from "@/types";

interface MessagePageProps {
  setActiveView: (view: ViewType) => void;
  userName: string;
  isDarkMode: boolean;
}

const MessagePage: React.FC<MessagePageProps> = ({
  setActiveView,
  userName,
  isDarkMode,
}) => {
  const [message, setMessage] = useState("");

  const messages = [
    { id: 1, text: "Hi, nice to meet you!", sender: "other", time: "11:35 PM" },
    {
      id: 2,
      text: "Same here! Should we plan a meetup?",
      sender: "other",
      time: "11:36 PM",
    },
    { id: 3, text: "Sure!", sender: "me", time: "11:36 PM" },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 border-b ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
      >
        <button
          onClick={() => setActiveView("messages")}
          className="mr-4 hover:opacity-70"
        >
          <FaArrowLeft size={20} />
        </button>
        <div
          className={`rounded-full p-2 mr-3 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
        >
          <FaRegUser
            size={20}
            className={isDarkMode ? "text-gray-400" : "text-gray-600"}
          />
        </div>
        <h2 className="text-xl font-bold">{userName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender === "me"
                  ? isDarkMode
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-500 text-white"
                  : isDarkMode
                    ? "bg-zinc-800 text-white"
                    : "bg-gray-200 text-black"
              }`}
            >
              <p>{msg.text}</p>
            </div>
            <span
              className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
            >
              {msg.time}
            </span>
          </div>
        ))}

        {/* Map Card */}
        <div className="flex justify-start">
          <div
            className={`max-w-[70%] rounded-2xl overflow-hidden ${
              isDarkMode ? "bg-zinc-800" : "bg-gray-200"
            }`}
          >
            <div className="h-40 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">Map Preview</span>
            </div>
            <div className="p-3 flex gap-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors">
                Open in Maps
              </button>
              <button
                className={`flex-1 text-sm py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-black"
                }`}
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-start">
          <span
            className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
          >
            11:55 PM
          </span>
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`p-4 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something..."
            className={`flex-1 rounded-full px-6 py-3 focus:outline-none ${
              isDarkMode
                ? "bg-zinc-800 text-white placeholder-gray-500"
                : "bg-gray-100 text-black placeholder-gray-400 border border-gray-300"
            }`}
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors">
            <FaPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
