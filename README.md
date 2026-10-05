# 💧 Water Buddy

Water Buddy is a desktop hydration widget built with **MERN + Electron**. A tiny, animated buddy walks across your screen at configured intervals to remind you to drink water, keeping you hydrated without interrupting your workflow!

## 🌟 Features

- **Non-intrusive Overlay**: The character walks across a transparent, click-through window that stays on top of other apps but never blocks your mouse clicks.
- **Interactive Tooltip**: Hover over the character to disable click-through and interact with the Yes/No prompts.
- **Beautiful Settings Dashboard**: Configure your hydration goals, adjust reminder intervals (e.g., 30, 45, or 60 mins), and view a log of your daily water intake.
- **Cloud Sync**: Optional Node.js/MongoDB backend allows you to sync your settings and hydration logs across multiple devices.
- **Offline First**: All logs are saved locally using `electron-store` and batched to the server once online.

## 📂 Architecture

- **Desktop App** (`apps/desktop`): Built with Electron, React, and Vite.
- **Backend Server** (`apps/server`): Built with Node.js, Express, and MongoDB (Mongoose).

---

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v16+) installed.

### 2. Install Dependencies
From the root of the project, install all dependencies for both the desktop app and the server using npm workspaces:
```bash
npm install
```

### 3. Setup the Backend (Optional but recommended for Sync)
Navigate to the server directory and configure your environment variables:
```bash
cd apps/server
```
Rename `.env.example` to `.env` and fill in your MongoDB Atlas connection string:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=super-secret-water-buddy
```

Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 4. Start the App (Backend + Desktop)
From the root of the project, you can start both the Node.js API and the Electron/React Desktop App simultaneously with a single command:
```bash
npm run start
```
This uses `concurrently` to run both workspaces at once. You will see the backend spin up and the Water Buddy icon appear in your system tray.

---

## 📦 How to Build for Production

To package the app into a standalone Windows installer (`.exe`), navigate to the desktop directory and run:
```bash
cd apps/desktop
npm run dist
```
Once the build finishes, you can find the installer in `apps/desktop/release/Water Buddy Setup 0.0.0.exe`.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, CSS Modules (Glassmorphism UI)
- **Desktop Shell**: Electron, electron-store, electron-builder
- **Backend**: Node.js, Express, jsonwebtoken, bcrypt
- **Database**: MongoDB, Mongoose
