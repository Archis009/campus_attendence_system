# Deployment Guide for Campus Attendance System

This guide outlines the step-by-step process to deploy your MERN stack application (MongoDB, Express, React, Node.js).

## Prerequisites

1.  **GitHub Account**: Your code must be pushed to a GitHub repository.
2.  **MongoDB Atlas Account**: For hosting the database in the cloud.
3.  **Render Account**: For hosting the Backend (Server).
4.  **Vercel (or Netlify) Account**: For hosting the Frontend (Client).

---

## Step 1: Database Setup (MongoDB Atlas)

Since you cannot use a local MongoDB for a deployed app, you need a cloud instance.

1.  **Create an Account/Cluster**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account. Create a new "Shared" (free) cluster.
2.  **Create a Database User**: In the "Security" -> "Database Access" tab, create a new user (e.g., `admin`). Remember the password!
3.  **Network Access**: In "Security" -> "Network Access", add a new IP address. Select **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is required so your Render server can connect to it. 
4.  **Get Connection String**:
    - Click "Connect" on your Cluster.
    - Select "Drivers" (Node.js).
    - Copy the string. It looks like: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    - Replace `<password>` with your actual password.
    - **Save this string**, you will need it for the Backend deployment.

---

## Step 2: Backend Deployment (Render)

We will use Render because it supports persistent Node.js servers nicely for free.

1.  **New Web Service**: Log in to [Render](https://render.com/), click "New" -> "Web Service".
2.  **Connect GitHub**: Select your repository.
3.  **Configure Service**:
    - **Name**: `campus-attendance-server` (or similar)
    - **Root Directory**: `server` (Important! Your backend is in the `server` folder).
    - **Environment**: Node.js
    - **Build Command**: `npm install`
    - **Start Command**: `node index.js`
4.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these:
    - `MONGO_URI`: Paste your MongoDB connection string from Step 1.
    - `JWT_SECRET`: Enter a long random string (e.g., `mysecretkey123`).
    - `FRONTEND_URL`: For now, set this to `*`. Once your frontend is deployed, you should come back and update this to your frontend's URL (e.g., `https://my-app.vercel.app`) to secure CORS.
5.  **Deploy**: Click "Create Web Service". Wait for it to finish.
6.  **Copy Backend URL**: Once done, copy the URL (e.g., `https://campus-attendance-server.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)

1.  **New Project**: Log in to [Vercel](https://vercel.com/) and click "Add New..." -> "Project".
2.  **Import Git Repository**: Select your repo.
3.  **Configure Project**:
    - **Root Directory**: Click "Edit" and select `client`.
    - **Framework Preset**: It should auto-detect "Vite".
    - **Build Command**: `npm run build` (default is fine).
    - **Output Directory**: `dist` (default in newer Vite, checking `package.json` confirms `vite build` uses `dist`).
4.  **Environment Variables**:
    - **Name**: `VITE_API_URL`
    - **Value**: Paste your **Backend URL** from Step 2 (e.g., `https://campus-attendance-server.onrender.com`).
    - _Note: Do not add a trailing slash `/`._
5.  **Deploy**: Click "Deploy".
6.  **Verify**: Visit the deployed URL. It should load.

---

## Step 4: Finalizing

1.  **Update CORS**: Go back to your Render Dashboard -> Environment Variables. Change `FRONTEND_URL` from `*` to your actual Vercel URL (e.g., `https://your-project.vercel.app`). This prevents other sites from using your API.
2.  **Test**: Register a new user, create a class, generate a QR code, and try to join with the student view.

## Notes on Code Changes

I have already refactored your client code to support deployment:

- **Centralized API**: Created `client/src/utils/axiosInstance.js` to handle API calls.
- **Environment Support**: The app now checks `import.meta.env.VITE_API_URL`. If unset (locally), it falls back to `http://localhost:5001`. On Vercel, it will use the variable you set in Step 3.

You are ready to deploy!
