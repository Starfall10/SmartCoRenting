"use client";
import React, { useState, useEffect } from "react";
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
import { ViewType, UserData } from "@/types";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "@/lib/firebase/user";

const AppPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("welcome");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedMessageUser, setSelectedMessageUser] = useState<string | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setCurrentUser(userData);
            if (!userData.profileComplete) {
              setActiveView("addprofile");
            } else {
              setActiveView("home");
            }
          } else {
            setActiveView("login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setActiveView("login");
        }
      } else {
        setCurrentUser(null);
        setActiveView("welcome");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showNavbar = ![
    "welcome",
    "login",
    "addprofile",
    "messageIndividual",
  ].includes(activeView || "");

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${isDarkMode ? "bg-black" : "bg-white"}`}
      >
        <div className={`text-xl ${isDarkMode ? "text-white" : "text-black"}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center min-h-screen ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <div className="w-full max-w-4xl relative">
        {activeView === "welcome" && (
          <WelcomePage setActiveView={setActiveView} isDarkMode={isDarkMode} />
        )}
        {activeView === "login" && (
          <LoginPage
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
            setCurrentUser={setCurrentUser}
          />
        )}
        {activeView === "home" && (
          <HomePage
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
          />
        )}
        {activeView === "addprofile" && (
          <AddProfilePage
            setActiveView={setActiveView}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
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
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
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
