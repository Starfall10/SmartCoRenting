import React from "react";
import { RiHome2Line } from "react-icons/ri";
import { FaRegMessage } from "react-icons/fa6";
import { PiGraph } from "react-icons/pi";
import { FiMapPin } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { ViewType } from "@/types";

interface NavbarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  isDarkMode,
}) => {
  const buttons = [
    { id: "home" as ViewType, icon: RiHome2Line, label: "Home" },
    { id: "messages" as ViewType, icon: FaRegMessage, label: "Messages" },
    { id: "match" as ViewType, icon: PiGraph, label: "Match" },
    { id: "meeting" as ViewType, icon: FiMapPin, label: "Meeting" },
    { id: "profile" as ViewType, icon: FaRegUser, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center">
      <div
        className={`w-full max-w-4xl flex justify-around items-center h-16 border-t ${
          isDarkMode ? "bg-black border-zinc-800" : "bg-white border-gray-200"
        }`}
      >
        {buttons.map((button) => {
          const Icon = button.icon;
          const isActive = activeView === button.id;
          return (
            <button
              key={button.id}
              onClick={() => setActiveView(button.id)}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label={button.label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
