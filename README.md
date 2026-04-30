# SmartCoRenting

A roommate matching and coordination platform that helps users find compatible roommates, communicate in real time, and coordinate meetings before deciding to live together.

This project was developed as a final year undergraduate project for **Smart Co-Renting: Roommate Matching Application**.

---

## 📋 Project Overview

The system allows users to:

- Register and log in securely
- Create and update a roommate profile
- Provide rental preferences and lifestyle information
- Receive roommate recommendations using a rule-based compatibility algorithm
- View compatibility scores and explanations
- Chat with matched users in real time
- Share locations through chat
- Schedule and manage meetings

The project focuses on transparent and explainable roommate matchmaking. Rather than using a black-box recommendation model, the system uses hard constraint filtering and weighted compatibility scoring to generate interpretable match results.

---

## 📁 Repository Structure

The project is organized into three main folders:

smartcorenting/ → Main Next.js web application
realtime/ → Socket.IO real-time messaging server
deploy/ → Deployment scripts and configuration files

### **smartcorenting/** - Main Web Application

The main web application built with Next.js. Key components include:

**Folders & Files:**

- app/ - Main application pages and API routes
- components/ - Reusable UI components
- lib/ - Shared logic, Firebase setup, and matchmaking code
- types/ - Shared TypeScript type definitions
- package.json - Dependencies and scripts

**Features:**

- User interface and pages
- User registration and login
- Profile onboarding and editing
- Matchmaking logic and API routes
- Compatibility score explanations
- Messaging interface
- Meeting scheduling features
- Firebase and Firestore integration
- Google Maps and calendar invite integration

### **realtime/** - Real-Time Messaging Server

A standalone Node.js + Socket.IO server for real-time chat communication.

**Key File:**

- server.js - The real-time messaging server

**Responsibilities:**

- Managing WebSocket connections
- Sending and receiving chat messages
- Broadcasting messages to conversation rooms
- Persisting messages to Firestore

### **deploy/** - Deployment Configuration

Contains deployment-related scripts and configuration files for production deployment of both services.

---

## 🛠️ Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Socket.IO
- **Database & Auth:** Firebase Authentication, Firestore, Firebase Admin SDK
- **APIs & Services:** Google Maps API, Resend (email)
- **Infrastructure:** Docker, Google Cloud Run

---

## 🚀 Running the Project Locally

### Prerequisites

- Node.js and pnpm installed
- Firebase project credentials
- Google Maps API key
- Resend API key
- Required environment variables configured

> ⚠️ **Note:** No secret keys, passwords, or .env files are included in this repository for security reasons.

### Installation

**1. Clone the repository**

```
git clone https://github.com/Starfall10/SmartCoRenting
cd SmartCoRenting
```

**2. Install dependencies for the web application**

```
cd smartcorenting
pnpm install
```

If pnpm is not installed:

```
npm install -g pnpm
```

**3. Install dependencies for the real-time server**

Open a second terminal and run:

```
cd realtime
pnpm install
```

### Environment Variables

Create environment files with your credentials:

**smartcorenting/.env.local**

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_value_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_value_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_value_here
RESEND_API_KEY=your_value_here
```

**realtime/.env**

```
FIREBASE_SERVICE_ACCOUNT=your_value_here
PORT=4000
```

### Starting the Application

**1. Start the real-time messaging server**

In the `realtime/` folder:

```
pnpm dev
```

Or if no development script is configured:

```
node server.js
```

The server typically runs on: http://localhost:4000

**2. Start the Next.js web application**

In the `smartcorenting/` folder:

```
pnpm dev
```

The application typically runs on: http://localhost:3000

---

## 📱 Deployed Application

A deployed version of the application is provided in the supporting material PDF. The deployed version should be used as the runnable version of the software, as the local version requires private environment variables and third-party service credentials.

---

## 🔐 Security Notice

This repository intentionally excludes:

- .env and .env.local files
- Firebase service account keys
- Google Maps API keys
- Resend API keys
- Private credentials and tokens
- node_modules/, .next/, build/, dist/ directories

This ensures that sensitive credentials are not exposed.

---

## 📚 Additional Documentation

For a more detailed technical explanation of the system architecture, implementation structure, and data flow, see:

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)

---

## 📝 Notes

- Source code is provided in this GitHub repository
- The deployed application link is provided in the supporting material PDF
- Local setup requires private environment variables and third-party service credentials
- If local setup is not possible due to missing credentials, use the deployed application for demonstration
