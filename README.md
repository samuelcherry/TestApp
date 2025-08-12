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
bash
Copy
Edit
app/
├── tabs/ # Main navigation tabs: index, profiles, eventDetails
├── API/ # API interaction utilities
├── context/ # React context providers and hooks
├── assets/ # Static assets like images, icons
├── components/ # Reusable UI components and views
│ ├── ui/ # UI primitives and themed components
│ ├── **tests**/ # Component tests
│ ├── Collapsible.tsx
│ ├── DateView.tsx
│ ├── ExternalLink.tsx
│ ├── ... # Other components
├── constants/ # App-wide constants and enums
├── hooks/ # Custom React hooks
Installation & Running
Ensure you have Node.js installed (v16+ recommended).

Install Expo CLI globally if needed:

bash
Copy
Edit
npm install -g expo-cli
Clone the repo:

bash
Copy
Edit
git clone https://github.com/samuelcherry/TestApp.git
cd TestApp
Install dependencies:

bash
Copy
Edit
npm install
Start Expo server:

bash
Copy
Edit
expo start
Use the Expo Go app on your phone to scan the QR code or launch on a simulator.

Usage
Sign in using your account (powered by Supabase auth).

Create new events and invite friends to input their available times.

View everyone's shared schedules to find common free slots quickly.

Receive real-time updates when participants change their availability.

Contributing
Contributions are welcome! Feel free to open issues or submit pull requests for improvements or bug fixes.

License
MIT License

If you want, I can generate a ready-to-use README.md text file for you to copy directly into your repo. Would you like that?
