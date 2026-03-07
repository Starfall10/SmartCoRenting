"use client";
import React, { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "smartcorenting_activeView";
const VALID_PERSIST_VIEWS: ViewType[] = [
  "home",
  "messages",
  "match",
  "meeting",
  "profile",
];

const AppPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("welcome");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: { uid: string; name: string };
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrapper function to persist view changes
  const handleSetActiveView = useCallback((view: ViewType) => {
    setActiveView(view);
    // Only persist main navigation views
    if (VALID_PERSIST_VIEWS.includes(view)) {
      try {
        localStorage.setItem(STORAGE_KEY, view);
      } catch (e) {
        // localStorage might be unavailable
      }
    }
  }, []);

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
              // Try to restore saved view from localStorage
              try {
                const savedView = localStorage.getItem(STORAGE_KEY) as ViewType;
                if (savedView && VALID_PERSIST_VIEWS.includes(savedView)) {
                  setActiveView(savedView);
                } else {
                  setActiveView("home");
                }
              } catch {
                setActiveView("home");
              }
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
        // Clear saved view on logout
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
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
          <WelcomePage
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "login" && (
          <LoginPage
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
            setCurrentUser={setCurrentUser}
          />
        )}
        {activeView === "home" && (
          <HomePage
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
          />
        )}
        {activeView === "addprofile" && (
          <AddProfilePage
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
        {activeView === "messages" && (
          <MessageHubPage
            setActiveView={handleSetActiveView}
            setSelectedConversation={setSelectedConversation}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
          />
        )}
        {activeView === "messageIndividual" && selectedConversation && (
          <MessagePage
            setActiveView={handleSetActiveView}
            conversationId={selectedConversation.id}
            otherUser={selectedConversation.otherUser}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "match" && (
          <MatchMakingPage
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            setActiveView={handleSetActiveView}
            setSelectedConversationUser={(user) => {
              if (user) {
                setSelectedConversation({
                  id: "", // New conversation - will be created
                  otherUser: { uid: user.odid, name: user.name },
                });
              }
            }}
          />
        )}
        {activeView === "meeting" && (
          <MeetingPage isDarkMode={isDarkMode} currentUser={currentUser} />
        )}
        {activeView === "profile" && (
          <ProfilePage
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}

        {showNavbar && (
          <Navbar
            activeView={activeView}
            setActiveView={handleSetActiveView}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default AppPage;
