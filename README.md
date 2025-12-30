# Campus Attendance System 🎓

A production-ready full-stack MERN application for managing student attendance using time-limited QR codes.
Built with **React (Vite)**, **Node.js**, **Express**, **MongoDB**, and **Tailwind CSS**.

---

## 🚀 Key Features

### 👨‍🏫 Teacher Dashboard

- **Class Management**: Create and manage multiple classes.
- **Dynamic QR Codes**: Generate secure, time-limited (60s) QR codes for attendance.
- **Live Monitoring**: View real-time attendance updates.
- **Data Export**: Export attendance records to CSV format.
- **Secure Access**: Role-based protection for teacher-only routes.

### 🎓 Student Dashboard

- **Easy Enrollment**: Browse available classes and join with a single click (or code).
- **Auto-Mark Attendance**: Attendance is automatically marked upon joining a class.
- **QR Scanning**: Scan QR codes for daily attendance in physical classes.
- **History Tracking**: View complete history of attended timestamped sessions.

### 🔒 Security & Tech

- **JWT Authentication**: Secure stateless authentication with hard 60s QR code expiry.
- **Password Hashing**: `bcrypt` for secure password storage.
- **Role-Based Access Control (RBAC)**: Strict middleware protection for Student vs Teacher routes.
- **Duplicate Prevention**: Backend logic prevents double-scanning for the same class on the same day.

---

## 🛠️ Tech Stack

**Frontend**

- **React 18** (Vite)
- **Tailwind CSS** (Styling)
- **React Router 6** (Navigation)
- **Axios** (API Communication)
- **Html5-Qrcode** (Scanner)

**Backend**

- **Node.js & Express**
- **MongoDB & Mongoose**
- **JWT** (JSON Web Tokens)
- **Bcryptjs** (Encryption)

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas Connection String)

### 1. Clone & Configure Backend

```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/campus_attendance
JWT_SECRET=your_super_secret_key_123
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
# Server running on port 5001
```

### 2. Configure Frontend

```bash
cd client
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🧪 Sample Credentials

Use these credentials to test the role-based features immediately:

| Role        | Email              | Password |
| ----------- | ------------------ | -------- |
| **Teacher** | `teacher@test.com` | `123456` |
| **Student** | `student@test.com` | `123456` |

_(You can also register new accounts via the Registration page)_

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login & receive JWT
- `GET /api/auth/me` - Get current user profile

### Classes

- `POST /api/classes` - Create new class (Teacher only)
- `GET /api/classes` - List my classes
- `GET /api/classes/available` - List all unenrolled classes (Student only)
- `POST /api/classes/enroll` - Join class & mark attendance (Student only)
- `GET /api/classes/:id/qr` - Generate 60s validity QR Token (Teacher only)

### Attendance

- `POST /api/attendance/mark` - Mark attendance via QR Scan
- `GET /api/attendance/history` - View my history
- `GET /api/attendance/class/:classId` - View class attendance (Teacher only)
- `GET /api/attendance/export/:classId` - Download CSV Report

---

## 🚀 Deployment

1. **Frontend**: Run `npm run build` in `/client`. Serve the `dist` folder via Nginx/Vercel/Netlify.
2. **Backend**: Host on Heroku/Render/AWS. Ensure `MONGO_URI` and `JWT_SECRET` are set in production env variables.
3. **CORS**: Update `FRONTEND_URL` in backend `.env` to match your production domain.

---

## 📝 License

Resume Project - MIT License.
