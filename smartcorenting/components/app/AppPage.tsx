"use client";
import React, { useState } from "react";
import WelcomePage from "../welcome/WelcomePage";
import LoginPage from "../login/LoginPage";
import HomePage from "../home/HomePage";
import AddProfilePage from "../addProfile/AddProfilePage";
import MessageHubPage from "../message/MessageHubPage";
import MessagePage from "../message/MessagePage";
import MeetingPage from "../meeting/MeetingPage";
import ProfilePage from "../profile/ProfilePage";
import MatchMakingPage from "../match/MatchMakingPage";
import Navbar from "../nav/Navbar";
import { ViewType } from "@/types";

const AppPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("welcome");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedMessageUser, setSelectedMessageUser] = useState<string | null>(
    null,
  );

  const showNavbar = ![
    "welcome",
    "login",
    "addprofile",
    "messageIndividual",
  ].includes(activeView || "");

  return (
    <div
      className={`flex justify-center min-h-screen ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <div className="w-full max-w-4xl relative">
        {activeView === "welcome" && (
          <WelcomePage setActiveView={setActiveView} isDarkMode={isDarkMode} />
        )}
        {activeView === "login" && (
          <LoginPage setActiveView={setActiveView} isDarkMode={isDarkMode} />
        )}
        {activeView === "home" && (
          <HomePage setActiveView={setActiveView} isDarkMode={isDarkMode} />
        )}
        {activeView === "addprofile" && (
          <AddProfilePage
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "messages" && (
          <MessageHubPage
            setActiveView={setActiveView}
            setSelectedMessageUser={setSelectedMessageUser}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "messageIndividual" && (
          <MessagePage
            setActiveView={setActiveView}
            userName={selectedMessageUser || "User"}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "match" && <MatchMakingPage isDarkMode={isDarkMode} />}
        {activeView === "meeting" && <MeetingPage isDarkMode={isDarkMode} />}
        {activeView === "profile" && (
          <ProfilePage
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}

        {showNavbar && (
          <Navbar
            activeView={activeView}
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default AppPage;
