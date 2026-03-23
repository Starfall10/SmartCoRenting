# SmartCoRenting Project Architecture

## 1. Project Overview

SmartCoRenting is a roommate matching and coordination platform made of two deployable parts:

1. `smartcorenting/`
   - A Next.js 16 application using React 19 and TypeScript.
   - Hosts the main UI, API routes, Firebase client/admin access, matchmaking logic, meeting planning, and email invite generation.
2. `realtime/`
   - A standalone Node.js + Express + Socket.IO service.
   - Handles real-time chat delivery and persists chat messages into Firestore using Firebase Admin.

At a high level, the product supports:

- User sign-up and sign-in with Firebase Authentication.
- Profile onboarding and editing.
- Matchmaking based on hard constraints and weighted compatibility scoring.
- One-to-one conversations.
- Real-time messaging through Socket.IO.
- Sharing map locations in chat.
- Scheduling and responding to meeting invites.
- Sending `.ics` calendar invites by email.

## 2. Main Technologies and External Tools

### Frontend and app framework

- `Next.js 16.1.4`
  - App Router structure under `smartcorenting/app/`.
  - API routes under `smartcorenting/app/api/`.
- `React 19.2.3`
  - Used for all UI components.
- `TypeScript`
  - Used across the web app for type safety.
- `Tailwind CSS 4`
  - Utility-first styling in components and `app/globals.css`.

### Backend and data

- `Firebase`
  - Client SDK for auth and Firestore reads/writes from the browser.
- `firebase-admin`
  - Used in Next.js server routes and the realtime server for privileged Firestore access.
- `Firestore`
  - Stores users, conversations, messages, meetings, and cached match results.

### Realtime communication

- `Socket.IO`
  - `socket.io-client` in the Next.js app.
  - `socket.io` server in `realtime/server.js`.

### Maps and location

- `@vis.gl/react-google-maps`
  - Used for embedded maps and markers.
- Google Maps JavaScript Places APIs
  - Used to search places and fetch place details.

### Email and calendar

- `Resend`
  - Sends email with attached `.ics` calendar invite files.

### UI helpers

- `react-icons`
  - Used throughout the UI for icons.

## 3. Repository Structure

### Root folders

- `deploy/`
  - Batch scripts for deployment and environment setup.
- `realtime/`
  - Socket.IO server.
- `smartcorenting/`
  - Main web application.

## 4. Runtime Architecture

### 4.1 Web app runtime

The browser loads the Next.js app. The root page renders a single client-side shell component, `AppPage`, which acts like an internal state router. Instead of using multiple page routes for the main product flow, it switches between views such as welcome, login, home, messages, match, meeting, and profile.

### 4.2 Authentication flow

1. Firebase client auth signs users in or creates accounts.
2. The app posts user identity data to `/api/auth/session`.
3. That route stores a lightweight session cookie.
4. Other API routes read that cookie to identify the current user.
5. User profile data is stored separately in Firestore under `users/{uid}`.

### 4.3 Messaging flow

1. The UI opens a conversation screen.
2. The client connects to the Socket.IO server using `NEXT_PUBLIC_SOCKET_URL`.
3. The client joins a room named after the conversation ID.
4. When a message is sent, the client emits `chat:message`.
5. The realtime server persists the message to Firestore.
6. The realtime server broadcasts the saved message back to the room.
7. The UI also subscribes to Firestore messages for history and consistency.

This means chat uses both:

- Firestore for durable storage and history.
- Socket.IO for low-latency delivery.

### 4.4 Matchmaking flow

1. The user completes their profile.
2. The match page calls `/api/matches/find`.
3. The server loads the current user and all completed candidate profiles.
4. The matchmaking algorithm filters candidates using hard constraints.
5. It computes weighted similarity scores for the remaining candidates.
6. Results are cached in Firestore under `matches/{userId}/results`.

### 4.5 Meeting flow

1. The user selects a place on the map or via search.
2. The user can share the location into an existing conversation.
3. The user can schedule a meeting with a contact.
4. A meeting document is created in Firestore.
5. A `meeting_invite` chat message is sent through Socket.IO.
6. The recipient sees a meeting invite card in chat and can accept or reject.
7. Accepted meetings appear in the meeting page’s upcoming meetings list.
8. The user can send an `.ics` invite email through `/api/send-ics`.

## 5. Data Model Summary

The main shared types are defined in `smartcorenting/types/index.ts`.

### `ViewType`

Represents the current in-app screen:

- `welcome`
- `login`
- `home`
- `addprofile`
- `messages`
- `messageIndividual`
- `match`
- `meeting`
- `profile`

### `UserData`

Represents a user profile and onboarding state.

Important fields:

- Identity: `uid`, `email`, `displayName`, `photoURL`
- Profile state: `profileComplete`, `profileStep`
- Basic preferences: gender, budget, location, move-in date, stay length, property type
- Binary preferences: `smoking`, `pets`
- Lifestyle sliders: sleep schedule, cleanliness, noise tolerance, work habits, social lifestyle, guest frequency, cooking frequency, personal space, activity level
- Legacy fields: `fullName`, `age`, `lifestyleTags`, `constraintTags`, `bio`
- Saved chat references: `savedConversations`

### `Conversation`

Represents a chat thread:

- `id`
- `participants`
- `participantNames`
- `lastMessage`
- `lastMessageAt`
- `createdAt`

### `Message`

Represents a chat message.

Supports multiple message types:

- `text`
- `location`
- `meeting_invite`

### `Meeting`

Represents a scheduled or pending meeting between two users.

Important fields:

- creator and invitee identity
- selected location
- scheduled date and time
- status: `pending`, `accepted`, `rejected`, `rescheduled`
- `pendingApprovalFrom`
- previous schedule fields for rescheduling

### `PlaceDetails`

Represents a selected Google Maps place.

## 6. Main App Entry Points

### `smartcorenting/app/layout.tsx`

Purpose:

- Defines the root HTML layout.
- Loads Geist fonts.
- Imports global CSS.
- Sets page metadata.

What it links to:

- Wraps the entire Next.js app.
- Provides the base document structure for all pages.

### `smartcorenting/app/page.tsx`

Purpose:

- Main page entrypoint.
- Renders `AppPage`.

What it links to:

- Delegates all actual application flow to `components/app/AppPage.tsx`.

## 7. Core Application Shell

### `smartcorenting/components/app/AppPage.tsx`

Purpose:

- Central client-side controller for the app.
- Maintains the active view and current user state.
- Decides which major screen component to render.

Main state:

- `activeView`
- `isDarkMode`
- `selectedConversation`
- `currentUser`
- `loading`

Main functions and logic:

- `handleSetActiveView(view)`
  - Updates the current screen.
  - Persists certain views to local storage.
- `onAuthStateChanged(...)` effect
  - Watches Firebase auth state.
  - Creates a session cookie through `/api/auth/session`.
  - Loads Firestore user data via `getUserData`.
  - Redirects incomplete users to profile onboarding.
  - Restores the last persisted view for complete users.

Components it renders conditionally:

- `WelcomePage`
- `LoginPage`
- `HomePage`
- `AddProfilePage`
- `MessageHubPage`
- `MessagePage`
- `MatchMakingPage`
- `MeetingPage`
- `ProfilePage`
- `Navbar`

How it links to other modules:

- Uses `auth` from Firebase client.
- Uses `getUserData` from `lib/firebase/user.ts`.
- Passes navigation callbacks and current user data into all major screens.

## 8. Firebase Modules

### `smartcorenting/lib/firebase/client.ts`

Purpose:

- Initializes the Firebase client SDK in the browser.

Exports:

- `app`
- `auth`
- `db`

Used by:

- Auth helpers
- Firestore client helpers
- App shell and feature components

### `smartcorenting/lib/firebase/admin.ts`

Purpose:

- Initializes Firebase Admin for server-side use.

Exports:

- `adminDb`

Used by:

- Next.js API routes such as conversations and matches.

### `smartcorenting/lib/firebase/auth.ts`

Purpose:

- Wraps Firebase Authentication client operations.

Functions:

- `signUpWithEmail(email, password, displayName?)`
  - Creates a Firebase auth user.
  - Optionally updates the display name.
- `signInWithEmail(email, password)`
  - Signs in an existing user.
- `signOutUser()`
  - Signs out the current user.
- `resetPassword(email)`
  - Sends a password reset email.

Used by:

- `LoginPage`
- `ProfilePage` for logout flow

### `smartcorenting/lib/firebase/user.ts`

Purpose:

- Encapsulates Firestore operations for user documents.

Functions:

- `checkUserExists(uid)`
  - Returns whether a user document exists.
- `getUserData(uid)`
  - Loads a user profile from Firestore.
- `createUser(uid, email, displayName?)`
  - Creates a new Firestore user document with onboarding defaults.
- `updateUserProfile(uid, data)`
  - Updates arbitrary profile fields.
- `updateProfileStep(uid, step, profileComplete?)`
  - Updates onboarding progress.
- `updateLifestyleTags(uid, tags)`
  - Legacy helper for lifestyle tags.
- `updateConstraintTags(uid, tags)`
  - Legacy helper for constraint tags.
- `updateBio(uid, bio)`
  - Legacy helper for bio.

Used by:

- `AppPage`
- `LoginPage`
- `AddProfilePage`
- `ProfilePage`

## 9. Authentication and Session Components

### `smartcorenting/components/login/LoginPage.tsx`

Purpose:

- Handles sign-up and sign-in UI.

Main state:

- `isCreating`
- `email`
- `password`
- `displayName`
- `error`
- `loading`

Main functions:

- `handleGoogleAuth()`
  - Currently only simulates navigation to home.
  - This is not a real Google auth implementation yet.
- `handleAuthSuccess(uid, userEmail, name?)`
  - Creates a session cookie through `/api/auth/session`.
  - Checks whether the Firestore user exists.
  - Loads existing user data or creates a new user document.
  - Routes to `addprofile` or `home`.
- `handleSubmit(e)`
  - Calls either `signUpWithEmail` or `signInWithEmail`.
  - Then calls `handleAuthSuccess`.

Dependencies:

- `signUpWithEmail`, `signInWithEmail`
- `checkUserExists`, `createUser`, `getUserData`
- `react-icons/fc` for Google icon

Links to:

- `/api/auth/session`
- Firestore user creation and retrieval
- `AppPage` navigation state

## 10. Home and Navigation Components

### `smartcorenting/components/home/HomePage.tsx`

Purpose:

- Landing screen after login.
- Shows onboarding progress or a prompt to start matching.

Main function:

- `calculateProfileCompletion()`
  - Computes a simple completion percentage from selected profile fields.

Links to:

- `AddProfilePage` through `setActiveView("addprofile")`
- `MatchMakingPage` through `setActiveView("match")`

### `smartcorenting/components/nav/Navbar.tsx`

Purpose:

- Bottom navigation bar for the main app views.

Navigation targets:

- Home
- Messages
- Match
- Meeting
- Profile

Links to:

- `AppPage` state via `setActiveView`

## 11. Profile Onboarding and Editing

### `smartcorenting/components/addProfile/AddProfilePage.tsx`

Purpose:

- Multi-step onboarding flow for collecting roommate preferences.

Steps:

1. Basic information
2. Yes/no living preferences
3. Lifestyle slider preferences

Main state:

- `step`
- `saving`
- form fields for all profile attributes
- `sliderValues`

Main functions:

- `handleSliderChange(key, value)`
  - Updates one slider preference.
- `handleSaveAndContinue()`
  - Saves the current step to Firestore.
  - Advances to the next step.
  - Marks the profile complete on the final step.
- `handleBack()`
  - Moves back one step locally.
- `handleSkip()`
  - Saves current step progress and returns home.

Dependencies:

- `updateUserProfile`
- `updateProfileStep`

Links to:

- Firestore user profile document
- `HomePage` and `AppPage` via navigation and current user updates

### `smartcorenting/components/profile/ProfilePage.tsx`

Purpose:

- Displays the user profile.
- Allows editing of profile fields.
- Provides settings and logout.

Main state:

- `showSettings`
- `editing`
- `saving`
- `editData`

Main functions:

- `handleLogout()`
  - Calls Firebase sign-out.
  - Deletes the session cookie through `/api/auth/session`.
  - Clears current user state and routes to login.
- `handleStartEdit()`
  - Copies current user data into editable local state.
- `handleSave()`
  - Persists edited profile data to Firestore.
  - Updates local current user state.
- `handleCancel()`
  - Exits edit mode.
- `getSliderLabel(key, value)`
  - Converts slider values into human-readable labels.

Dependencies:

- `updateUserProfile`
- `signOutUser`

Links to:

- Firestore user document
- Session API route
- `AppPage` state

## 12. Matchmaking System

### `smartcorenting/components/match/MatchMakingPage.tsx`

Purpose:

- UI for finding and reviewing roommate matches.

Main state:

- `stage`
- `matches`
- `selectedMatch`
- `error`
- `isRecalculating`
- `filters`
- `showFilters`

Main functions:

- `toggleFilter(key)`
  - Enables or disables a hard constraint filter.
- `handleFindRoommate(forceRefresh?)`
  - Calls `/api/matches/find`.
  - Loads fresh or cached matches.
- `handleRecalculate()`
  - Forces a refresh of match results.
- `handleSeeProfile(match)`
  - Opens a detailed match profile view.
- `handleSeeReasoning()`
  - Opens the compatibility reasoning view.
- `handleStartConversation(match)`
  - Prepares a conversation target and routes to the individual message view.
- `handleBack()`
  - Moves backward between match subviews.
- `getScoreColor(score)`
  - Returns a color class for compatibility score display.
- `getSimilarityBarWidth(value)`
  - Converts similarity values into percentage widths.

Dependencies:

- `/api/matches/find`
- `MatchResult`, `SimilarityBreakdown`, `FACTOR_LABELS`

Links to:

- Matchmaking API route
- Matchmaking algorithm module
- Messaging flow through `setSelectedConversationUser`

### `smartcorenting/lib/matchmaking/algorithm.ts`

Purpose:

- Core compatibility engine.

Important exports:

- `ALGORITHM_VERSION`
- `FACTOR_LABELS`
- types: `SimilarityBreakdown`, `MatchExplanation`, `MatchResult`, `StoredMatchResult`

Hard constraint functions:

- `checkGenderCompatibility(userA, userB)`
- `checkBudgetCompatibility(userA, userB)`
- `checkLocationCompatibility(userA, userB)`
- `checkDateCompatibility(userA, userB)`
- `checkPropertyTypeCompatibility(userA, userB)`
- `hardConstraintCheck(userA, userB, filters)`

Similarity and scoring functions:

- `likertSimilarity(valueA, valueB)`
  - Computes similarity for 1-5 scale values.
- `binarySimilarity(valueA, valueB)`
  - Computes similarity for boolean preferences.
- `computeSimilarity(userA, userB)`
  - Produces a full factor-by-factor similarity breakdown.
- `computeCompatibility(breakdown)`
  - Produces a weighted compatibility score from the breakdown.

Explanation helpers:

- `getScoreCategory(score)`
  - Buckets scores into qualitative categories.
- The rest of the file builds human-readable explanations and final match results.

Overall role:

- Filters incompatible candidates.
- Scores compatible candidates.
- Produces explanations for why a match is strong or weak.

### `smartcorenting/lib/firebase/matches.ts`

Purpose:

- Client-side helper layer for match retrieval and caching.

Functions:

- `getAllCompletedUsers()`
  - Loads all users with completed profiles.
- `sanitizeForFirestore(obj)`
  - Removes `undefined` values before writing to Firestore.
- `storeMatchResults(userId, matches)`
  - Clears and rewrites cached match results.
- `getCachedMatches(userId)`
  - Loads cached results ordered by compatibility score.
- `findMatchesForUser(currentUser, forceRefresh?)`
  - Uses cache when valid.
  - Recomputes matches when stale.

Links to:

- Firestore `matches/{userId}/results`
- Matchmaking algorithm module

### `smartcorenting/app/api/matches/find/route.ts`

Purpose:

- Server-side endpoint for finding matches.

Main logic:

- Validates `userId`.
- Loads current user from Firestore using `adminDb`.
- Rejects requests if the profile is incomplete.
- Checks cached matches and validates staleness.
- Loads all completed candidate users.
- Calls `findMatches(currentUser, candidates, activeFilters)`.
- Rewrites cached results in Firestore.
- Returns matches and cache metadata.

Helper function:

- `sanitizeForFirestore(obj)`

Links to:

- `lib/firebase/admin.ts`
- `lib/matchmaking/algorithm.ts`
- Firestore `users` and `matches` collections

## 13. Messaging System

### `smartcorenting/lib/socket.ts`

Purpose:

- Creates and reuses a singleton Socket.IO client connection.

Function:

- `getSocket()`
  - Connects to `NEXT_PUBLIC_SOCKET_URL`.
  - Forces websocket transport.
  - Enables credentials.

Used by:

- `MessagePage`
- `ContactPickerModal`
- `ScheduleMeetingModal`

### `smartcorenting/lib/firebase/conversations.ts`

Purpose:

- Encapsulates Firestore conversation and message operations.

Functions:

- `getConversationId(uid1, uid2)`
  - Creates a stable conversation ID by sorting the two user IDs.
- `getOrCreateConversation(currentUid, otherUid, currentName, otherName)`
  - Loads or creates a conversation document.
- `getUserConversations(uid)`
  - Loads all conversations for a user.
- `subscribeToConversations(uid, callback)`
  - Real-time listener for conversation list updates.
- `getConversationMessages(conversationId, messageLimit?)`
  - Loads message history.
- `subscribeToMessages(conversationId, callback)`
  - Real-time listener for messages.
- `addMessage(conversationId, senderId, text)`
  - Client-side backup write helper for text messages.

Links to:

- Firestore `conversations` collection
- Firestore `conversations/{id}/messages` subcollections

### `smartcorenting/components/message/MessageHubPage.tsx`

Purpose:

- Displays the user’s conversation list.
- Allows starting a conversation by entering another user’s UID.

Main state:

- `conversations`
- `loading`
- `searchUid`
- `searchError`
- `isSearching`

Main functions:

- `fetchConversations()` effect
  - Calls `/api/conversations`.
  - Handles unauthorized responses by checking session state.
- `handleStartConversation()`
  - Calls `/api/user?uid=...` to verify the target user exists.
  - Calls `POST /api/conversations` to create or fetch a conversation.
  - Adds the conversation to local state and opens it.
- `handleConversationClick(conversation)`
  - Opens the selected conversation.
- `formatTime(dateStr)`
  - Formats relative timestamps for the conversation list.

Links to:

- `/api/conversations`
- `/api/user`
- `MessagePage`

### `smartcorenting/components/message/MessagePage.tsx`

Purpose:

- Displays a single conversation.
- Sends and receives messages.
- Renders special cards for location and meeting invite messages.

Main state:

- `messageText`
- `messages`
- `loading`
- `activeConversationId`

Main functions and effects:

- `scrollToBottom()`
  - Keeps the latest messages visible.
- `initConversation()` effect
  - Creates a conversation if the page was opened from a match without an existing conversation ID.
- messaging subscription effect
  - Joins the Socket.IO room.
  - Subscribes to Firestore messages.
  - Listens for `chat:message` and `chat:error` socket events.
  - Deduplicates incoming messages.
- `handleSendMessage()`
  - Emits a text message through Socket.IO.
- `handleKeyPress(e)`
  - Sends on Enter.
- `formatTime(dateStr)`
  - Formats message timestamps.

Special message rendering:

- `LocationCard` for `location` messages
- `MeetingInviteCard` for `meeting_invite` messages

Links to:

- `lib/socket.ts`
- `lib/firebase/conversations.ts`
- realtime Socket.IO server

### `smartcorenting/components/message/LocationCard.tsx`

Purpose:

- Displays a shared location inside chat.

Main functions:

- `handleOpenInMaps()`
  - Opens the place in Google Maps.
- `handleCopyAddress()`
  - Copies the address to clipboard.
- `handleGetDirections()`
  - Opens Google Maps directions.

Dependencies:

- `@vis.gl/react-google-maps`
- Google Maps URLs

Links to:

- Shared `PlaceDetails` data from meeting/location flows

### `smartcorenting/components/message/MeetingInviteCard.tsx`

Purpose:

- Displays a meeting invitation or reschedule request inside chat.

Main state:

- `meeting`
- `loading`
- `updating`

Main functions:

- `fetchMeeting()` effect
  - Loads the latest meeting data from Firestore.
- `handleResponse(status)`
  - Accepts or rejects a pending meeting.
- `formatDate(dateStr)`
- `formatTime(timeStr)`
- `getStatusBadge(status)`

Decision logic:

- Computes `canRespond` using `pendingApprovalFrom` and current user.
- Detects reschedules using `previousDate` and `previousTime`.

Dependencies:

- `getMeeting`
- `updateMeetingStatus`

Links to:

- Firestore meetings collection
- Meeting scheduling flow

## 14. Meeting and Map System

### `smartcorenting/components/meeting/MeetingPage.tsx`

Purpose:

- Main meeting planning screen.
- Lets users search/select places, share locations, schedule meetings, and review upcoming meetings.

Main state:

- `selected`
- `isContactPickerOpen`
- `isScheduleModalOpen`
- `meetings`
- `meetingsLoading`
- `rescheduleTarget`
- `sendingIcs`

Main functions:

- `fetchPlaceDetails(placeId)`
  - Uses Google Places service to load place details.
- meetings subscription effect
  - Uses `subscribeToUserMeetings` to keep meetings current.
- `formatDate(dateStr)`
- `formatTime(timeStr)`
- `handleReschedule(meeting)`
  - Opens the schedule modal in reschedule mode.
- `handleSendIcs(meeting)`
  - Calls `/api/send-ics` to email a calendar invite.

Rendered child components:

- `MapComponent`
- `PlaceSearch`
- `ContactPickerModal`
- `ScheduleMeetingModal`

Dependencies:

- `APIProvider` from `@vis.gl/react-google-maps`
- Google Maps API key
- Firestore meetings helpers
- `/api/send-ics`

Links to:

- Chat system for location sharing and meeting invites
- Firestore meetings collection
- Resend email route

### `smartcorenting/components/meeting/MapComponent.tsx`

Purpose:

- Wraps the interactive Google Map used on the meeting page.
- Receives a center point and map click handler.

Role in the system:

- Provides the visual map canvas for place selection.
- Passes map click events back to `MeetingPage`, which then resolves place details.

Links to:

- `MeetingPage`
- Google Maps rendering through `@vis.gl/react-google-maps`

### `smartcorenting/components/meeting/PlaceSearch.tsx`

Purpose:

- Provides the place search input over the map.

Role in the system:

- Lets the user search for a place instead of clicking directly on the map.
- Returns a selected place ID to `MeetingPage` through `onPicked`.

Links to:

- `MeetingPage`
- Google Places autocomplete/search behavior

### `smartcorenting/components/meeting/ContactPickerModal.tsx`

Purpose:

- Lets the user choose an existing contact and send a location into that chat.

Main state:

- `contacts`
- `loading`
- `sending`
- `sent`

Main functions:

- `fetchContacts()` effect
  - Loads conversations from `/api/conversations`.
- `handleShareLocation(contact)`
  - Emits a `location` message through Socket.IO.

Links to:

- Conversation list API
- Socket.IO chat flow
- `LocationCard` rendering in `MessagePage`

### `smartcorenting/components/meeting/ScheduleMeetingModal.tsx`

Purpose:

- Multi-step modal for creating or rescheduling a meeting.

Main state:

- `contacts`
- `loading`
- `sending`
- `selectedContact`
- `selectedDate`
- `selectedTime`
- `step`

Main functions:

- reschedule initialization effect
  - Pre-fills contact and date/time when editing an existing meeting.
- `fetchContacts()` effect
  - Loads available contacts from `/api/conversations`.
- `handleScheduleMeeting()`
  - Creates a new meeting or reschedules an existing one.
  - Emits a `meeting_invite` message through Socket.IO.
- `handleBack()`
  - Moves backward through modal steps.
- `handleNext()`
  - Advances through modal steps.

Dependencies:

- `createMeeting`
- `rescheduleMeeting`
- `getSocket()`

Links to:

- Firestore meetings collection
- Chat system via meeting invite messages
- `MeetingInviteCard`

### `smartcorenting/lib/firebase/meetings.ts`

Purpose:

- Encapsulates Firestore meeting operations.

Functions:

- `generateMeetingId()`
  - Creates a unique meeting ID.
- `createMeeting(...)`
  - Creates a pending meeting document.
- `getMeeting(meetingId)`
  - Loads one meeting.
- `getUserMeetings(uid)`
  - Loads meetings where the user is creator or invitee.
- `subscribeToUserMeetings(uid, callback)`
  - Real-time listener for both creator and invitee meeting queries.
- `updateMeetingStatus(meetingId, status)`
  - Accepts or rejects a meeting.
- `rescheduleMeeting(meetingId, newDate, newTime, reschedulerUid, message?)`
  - Updates the meeting schedule and sets approval back to pending.

Links to:

- Firestore `meetings` collection
- Meeting UI and chat invite cards

## 15. API Routes

### `smartcorenting/app/api/conversations/route.ts`

Purpose:

- Server-side conversation list and conversation creation endpoint.

Helper functions:

- `getSession()`
  - Reads and parses the `session` cookie.
- `saveConversationToUser(uid, conversationId, otherUid, otherName)`
  - Stores a conversation reference in the user document’s `savedConversations` array.

Handlers:

- `GET()`
  - Returns all conversations for the current session user.
- `POST(request)`
  - Creates or returns a conversation with another user.
  - Prevents self-conversations.
  - Ensures both users have saved conversation references.

Links to:

- Session cookie
- Firestore `conversations`
- Firestore `users`

### `smartcorenting/app/api/send-ics/route.ts`

Purpose:

- Sends a calendar invite email with an attached `.ics` file.

Helper function:

- `generateICS(meeting)`
  - Builds raw iCalendar content.

Handler:

- `POST(request)`
  - Validates request body.
  - Creates `.ics` content.
  - Base64-encodes it.
  - Sends email through Resend.

Important note:

- The recipient email is currently hardcoded to `yusei5283@gmail.com`.

Links to:

- `MeetingPage`
- Resend API

### Other API routes present in the project

The workspace also contains additional routes not fully expanded in this review:

- `app/api/auth/session/route.ts`
- `app/api/user/route.ts`
- `app/api/admin/delete-personas/route.ts`
- `app/api/admin/upload-users/route.ts`

Based on usage in the app:

- `/api/auth/session` manages the session cookie lifecycle.
- `/api/user` is used by `MessageHubPage` to verify a user exists by UID.
- The admin routes likely support bulk user/persona management.

## 16. Realtime Service

### `realtime/server.js`

Purpose:

- Dedicated Socket.IO server for chat delivery and message persistence.

Main setup:

- Loads environment variables with `dotenv`.
- Initializes Firebase Admin if credentials are available.
- Creates an Express app and HTTP server.
- Configures CORS from `CORS_ORIGINS`.
- Creates a Socket.IO server on top of the HTTP server.

Main function:

- `saveMessage(conversationId, message)`
  - Validates Firebase availability.
  - Ensures the conversation exists.
  - Builds message data for text, location, or meeting invite messages.
  - Writes the message to `conversations/{conversationId}/messages`.
  - Updates the parent conversation’s `lastMessage` and `lastMessageAt`.

Socket events:

- `connection`
  - Logs new socket connections.
- `chat:join`
  - Joins a room by conversation ID.
- `chat:leave`
  - Leaves a room.
- `chat:message`
  - Persists the message.
  - Broadcasts the saved message to the room.
- `disconnect`
  - Logs disconnections.

HTTP route:

- `GET /health`
  - Returns `ok` for health checks.

Links to:

- `smartcorenting/lib/socket.ts`
- Firestore conversations and messages
- Meeting and location message flows

## 17. Component Interaction Map

### Authentication path

1. `LoginPage`
2. `lib/firebase/auth.ts`
3. `lib/firebase/user.ts`
4. `/api/auth/session`
5. `AppPage`
6. `HomePage` or `AddProfilePage`

### Profile path

1. `AddProfilePage` or `ProfilePage`
2. `lib/firebase/user.ts`
3. Firestore `users`
4. `AppPage` current user state
5. `HomePage` and `MatchMakingPage`

### Matchmaking path

1. `MatchMakingPage`
2. `/api/matches/find`
3. `lib/firebase/admin.ts`
4. `lib/matchmaking/algorithm.ts`
5. Firestore `users` and `matches`
6. `MatchMakingPage` results UI
7. `MessagePage` if the user starts a conversation

### Messaging path

1. `MessageHubPage`
2. `/api/conversations`
3. `MessagePage`
4. `lib/socket.ts`
5. `realtime/server.js`
6. Firestore `conversations/{id}/messages`
7. `lib/firebase/conversations.ts`

### Location sharing path

1. `MeetingPage`
2. `ContactPickerModal`
3. `getSocket()`
4. `realtime/server.js`
5. Firestore message with `type: "location"`
6. `MessagePage`
7. `LocationCard`

### Meeting scheduling path

1. `MeetingPage`
2. `ScheduleMeetingModal`
3. `lib/firebase/meetings.ts`
4. Firestore `meetings`
5. `getSocket()`
6. `realtime/server.js`
7. Firestore message with `type: "meeting_invite"`
8. `MessagePage`
9. `MeetingInviteCard`
10. `MeetingPage` upcoming meetings list

### Calendar invite path

1. `MeetingPage`
2. `/api/send-ics`
3. `Resend`
4. Recipient email with attached `.ics`

## 18. Firestore Collections Used

### `users`

Stores user profiles and saved conversation references.

### `conversations`

Stores conversation metadata.

Subcollection:

- `messages`

### `meetings`

Stores meeting invitations, accepted meetings, and reschedules.

### `matches`

Per-user cached match results.

Subcollection:

- `results`

## 19. Notable Design Choices

### Single-page state router inside `AppPage`

The main product flow is controlled by React state rather than multiple Next.js routes. This makes the app feel like a mobile-style single-page application, but it also means:

- navigation is mostly internal state changes
- deep linking is limited
- `AppPage` becomes a central dependency for most screens

### Dual-source chat updates

Messages are both:

- persisted in Firestore
- delivered in real time through Socket.IO

This improves responsiveness while keeping durable history.

### Match caching

Match results are cached in Firestore and invalidated when:

- the algorithm version changes
- the source user profile changes
- a candidate profile changes

### Meeting invites as chat messages

Meetings are not only stored as standalone Firestore documents. They are also represented as chat messages, which keeps scheduling tied directly to the conversation experience.

## 20. Gaps and Observations

These are implementation observations from the current codebase:

- `LoginPage` has a placeholder `handleGoogleAuth()` and does not perform real Google sign-in yet.
- The main app uses internal view state instead of route-based navigation.
- `/api/send-ics` currently sends to a hardcoded email address.
- Some legacy user fields remain in the shared type model for backward compatibility.
- There are admin routes and some additional API routes present that were not deeply inspected here.

## 21. Quick File-by-File Summary

### Main app shell

- `smartcorenting/app/page.tsx`: mounts the app shell.
- `smartcorenting/app/layout.tsx`: root layout and metadata.
- `smartcorenting/components/app/AppPage.tsx`: central state router and auth bootstrap.

### Auth and user data

- `smartcorenting/lib/firebase/client.ts`: Firebase client init.
- `smartcorenting/lib/firebase/admin.ts`: Firebase Admin init.
- `smartcorenting/lib/firebase/auth.ts`: auth helpers.
- `smartcorenting/lib/firebase/user.ts`: user Firestore helpers.

### Main screens

- `smartcorenting/components/login/LoginPage.tsx`: sign-in/sign-up.
- `smartcorenting/components/home/HomePage.tsx`: dashboard.
- `smartcorenting/components/addProfile/AddProfilePage.tsx`: onboarding.
- `smartcorenting/components/match/MatchMakingPage.tsx`: roommate matching UI.
- `smartcorenting/components/message/MessageHubPage.tsx`: conversation list.
- `smartcorenting/components/message/MessagePage.tsx`: individual chat.
- `smartcorenting/components/meeting/MeetingPage.tsx`: map and meeting planner.
- `smartcorenting/components/profile/ProfilePage.tsx`: profile and settings.
- `smartcorenting/components/nav/Navbar.tsx`: bottom navigation.

### Messaging and meetings support

- `smartcorenting/lib/socket.ts`: Socket.IO client singleton.
- `smartcorenting/lib/firebase/conversations.ts`: conversation/message Firestore helpers.
- `smartcorenting/lib/firebase/meetings.ts`: meeting Firestore helpers.
- `smartcorenting/components/meeting/MapComponent.tsx`: map wrapper for place selection.
- `smartcorenting/components/meeting/PlaceSearch.tsx`: place search input for meeting planning.
- `smartcorenting/components/message/LocationCard.tsx`: shared place card.
- `smartcorenting/components/message/MeetingInviteCard.tsx`: meeting invite card.
- `smartcorenting/components/meeting/ContactPickerModal.tsx`: share location to a contact.
- `smartcorenting/components/meeting/ScheduleMeetingModal.tsx`: create/reschedule meeting.

### Matchmaking backend

- `smartcorenting/lib/matchmaking/algorithm.ts`: compatibility engine.
- `smartcorenting/lib/firebase/matches.ts`: match caching helpers.
- `smartcorenting/app/api/matches/find/route.ts`: server-side match endpoint.

### Conversation and email APIs

- `smartcorenting/app/api/conversations/route.ts`: conversation list/create endpoint.
- `smartcorenting/app/api/send-ics/route.ts`: email calendar invite endpoint.

### Realtime backend

- `realtime/server.js`: Socket.IO + Firestore persistence server.

## 22. End-to-End Summary

The project is structured around a central React app shell that coordinates several feature modules:

- authentication and user profile management through Firebase
- compatibility scoring through a custom matchmaking engine
- persistent chat through Firestore
- real-time delivery through Socket.IO
- map-based place selection through Google Maps
- meeting scheduling through Firestore-backed meeting documents
- calendar invite delivery through Resend

The strongest architectural links are:

- `AppPage` as the UI coordinator
- Firebase as the shared data backbone
- Socket.IO as the real-time transport layer
- Firestore documents as the source of truth for users, conversations, messages, meetings, and cached matches
