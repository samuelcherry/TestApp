CalAlign
CalAlign is a lightweight scheduling app designed specifically for friends. It solves the common problem of finding times when everyone is available — without bloated pro subscriptions or messy, hard-to-follow group text chains.

Built with React Native (using Expo), Material UI, and powered by Supabase for backend services, CalAlign focuses on simplicity and ease of use.

Features
Create and join events with friends

Share and compare available times easily

Automatic conflict detection

Real-time updates using Supabase

Clean, responsive UI with Material Design principles

Tech Stack
React Native (Expo)

Material UI (interface components)

Supabase (backend and database)

AsyncStorage (local device storage)

TypeScript for type safety

Project Structure

```bash
app/
├── tabs/ # Main navigation tabs: index, profiles, eventDetails
├── API/ # API interaction utilities
├── context/ # React context providers and hooks
├── assets/ # Static assets like images, icons
├── components/ # Reusable UI components views
│ ├── ui/ # UI primitives and themed components
│ ├── **tests**/ # Component tests
│ ├── DateView.tsx
│ ├── HapticTab.tsx
│ ├── NewEventButton.tsx
│ ├── Participants.tsx
│ ├── TimesView.Tsx
├── constants/ # App-wide constants and enums
├── hooks/ # Custom React hooks
```

Installation & Running
Ensure you have Node.js installed (v16+ recommended).

Install Expo CLI globally if needed:

```bash
npm install -g expo-cli
```

Clone the repo:

```bash
git clone https://github.com/samuelcherry/TestApp.git
cd TestApp
```

Install dependencies:

```bash
npm install
```

Start Expo server:

```bash
expo start
```

Use the Expo Go app on your phone to scan the QR code or launch on a simulator.

Usage
Sign in using your account (powered by Supabase auth).

Create new events and invite friends to input their available times.

View everyone's shared schedules to find common free slots quickly.

Receive real-time updates when participants change their availability.

Contributing
Not looking for contributions currently as this is a portfolio project showing my personal abilities
