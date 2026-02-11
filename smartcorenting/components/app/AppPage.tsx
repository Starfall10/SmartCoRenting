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
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: { uid: string; name: string };
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "[AppPage] Auth state changed:",
        firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email }
          : null,
      );

      if (firebaseUser) {
        try {
          // Ensure session cookie is set
          console.log(
            "[AppPage] Setting session cookie for authenticated user",
          );
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "",
            }),
          });

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
          console.error("[AppPage] Error fetching user data:", error);
          setActiveView("login");
        }
      } else {
        console.log("[AppPage] No Firebase user, clearing session");
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
            setSelectedConversation={setSelectedConversation}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
          />
        )}
        {activeView === "messageIndividual" && selectedConversation && (
          <MessagePage
            setActiveView={setActiveView}
            conversationId={selectedConversation.id}
            otherUser={selectedConversation.otherUser}
            currentUser={currentUser}
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
