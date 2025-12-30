import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import QRCode from "react-qr-code";
import EnrolledStudentsList from "../components/EnrolledStudentsList";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [qrToken, setQrToken] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingQr, setLoadingQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [viewMode, setViewMode] = useState('attendance'); // 'attendance' or 'students'

  // Schedule State
  const [schedule, setSchedule] = useState({
    days: [],
    startTime: "",
    endTime: ""
  });

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayChange = (day) => {
    setSchedule(prev => {
        const newDays = prev.days.includes(day) 
            ? prev.days.filter(d => d !== day)
            : [...prev.days, day];
        return { ...prev, days: newDays };
    });
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5001/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && qrToken) {
       setTimeout(() => setQrToken(""), 0);
    }
  }, [timeLeft, qrToken]);

  const createClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5001/api/classes",
        { 
            className: newClassName,
            days: schedule.days,
            startTime: schedule.startTime,
            endTime: schedule.endTime
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses([...classes, data]);
      setNewClassName("");
      setSchedule({ days: [], startTime: "", endTime: "" }); // Reset form
    } catch (error) {
      console.error("Error creating class", error);
      alert(error.response?.data?.message || "Failed to create class");
    }
  };

  const generateQR = async (classId) => {
    setLoadingQr(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5001/api/classes/${classId}/qr`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQrToken(data.qrToken);
      setTimeLeft(60); // 60 seconds
      setLoadingQr(false);
      // Ensure we switch view to QR or keep it visible
      setSelectedClass(null); 
    } catch (error) {
      console.error("Error generating QR", error);
      setLoadingQr(false);
    }
  };

  const viewStudents = (classId) => {
    const cls = classes.find((c) => c._id === classId);
    setSelectedClass(cls);
    setViewMode('students');
    setQrToken("");
  };

  const viewAttendance = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5001/api/attendance/class/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendanceData(data);
      setSelectedClass(classes.find((c) => c._id === classId));
      setViewMode('attendance');
      setQrToken(""); // Clear QR when viewing attendance
    } catch (error) {
      console.error("Error fetching attendance", error);
    }
  };

  const downloadCSV = async (classId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/attendance/export/${classId}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `attendance_${classId}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
            console.error("Error downloading CSV", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white">
                    T
                 </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Teacher Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-gray-300">
                Welcome, <span className="font-semibold text-white">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                 className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Management */}
          <div className="lg:col-span-4 space-y-8">
            {/* Create Class */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Create New Class
              </h2>
              <form onSubmit={createClass} className="flex flex-col gap-2">
                <input
                type="text"
                placeholder="Class Name (e.g. Physics 101)"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />

              {/* Schedule Inputs */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Schedule (Required)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {allDays.map(day => (
                        <button 
                            key={day}
                            type="button" // Added type="button" to prevent form submission
                            onClick={() => handleDayChange(day)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${schedule.days.includes(day) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                        <input 
                            type="time" 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                            value={schedule.startTime}
                            onChange={(e) => setSchedule({...schedule, startTime: e.target.value})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                        <input 
                            type="time" 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                            value={schedule.endTime}
                            onChange={(e) => setSchedule({...schedule, endTime: e.target.value})}
                        />
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20">
                  Add
                </button>
              </div>
              </form>
            </div>

            {/* Class List */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Your Classes</h2>
              <div className="space-y-3">
                {classes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No classes created yet.</p>
                ) : (
                    classes.map((cls) => (
                    <div
                        key={cls._id}
                        className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors flex flex-col gap-3"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-white">{cls.className}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Join Code:</span>
                                <span className="text-sm text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-1 rounded cursor-pointer hover:bg-blue-500/20" title="Click to copy" onClick={() => navigator.clipboard.writeText(cls.code || "No Code")}>
                                    {cls.code || "Generating..."}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 text-sm">
                        <button
                            onClick={() => generateQR(cls._id)}
                            className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                            QR Code
                        </button>
                        <button
                            onClick={() => viewAttendance(cls._id)}
                            className="flex-1 px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            History
                        </button>
                        <button
                            onClick={() => viewStudents(cls._id)}
                            className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            Students
                        </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Active View */}
          <div className="lg:col-span-8">
            {loadingQr ? (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl flex flex-col items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-400">Generating Secure QR Code...</p>
                </div>
            ) : qrToken ? (
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
                 <h2 className="text-2xl font-bold mb-8">Generated QR Code</h2>
                 <div className="p-4 bg-white rounded-xl shadow-2xl">
                    <QRCode value={qrToken} size={256} />
                 </div>
                 <div className="mt-8 text-center">
                     <p className="text-gray-400 mb-2">Scan this code with student app</p>
                     <div className="text-3xl font-mono font-bold text-red-400">
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                     </div>
                     <p className="text-sm text-gray-500 mt-1">Code remains valid for 1 minute</p>
                 </div>
              </div>
            ) : selectedClass ? (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClass.className}</h2>
                    <p className="text-gray-400 text-sm">
                        {viewMode === 'attendance' ? 'Attendance Records' : 'Enrolled Students'}
                    </p>
                  </div>
                  {viewMode === 'attendance' && (
                  <button
                    onClick={() => downloadCSV(selectedClass._id)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export CSV
                  </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                    {viewMode === 'attendance' ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {attendanceData.length === 0 ? (
                           <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">No attendance records found.</td>
                           </tr>
                      ) : (
                          attendanceData.map((record) => (
                            <tr key={record._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-white">{record.studentId?.name || "Unknown"}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{record.studentId?.email || "Unknown"}</td>
                            <td className="py-3 px-4 text-sm font-mono">
                                {new Date(record.date).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                {record.status}
                                </span>
                            </td>
                            </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                    // Students View
                    <div>
                         {/* To fetch students properly for display we might need to query the class details again or rely on what we have. 
                             Currently 'classes' prop doesn't populate students fully. 
                             Let's fetch current class details if viewing students to be sure.*/}
                           <EnrolledStudentsList classId={selectedClass._id} />
                    </div>
                )}
                </div>
              </div>
            ) : (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-lg min-h-[500px] flex flex-col items-center justify-center text-center text-gray-500">
                    <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                    <h3 className="text-xl font-bold mb-2">No Class Selected</h3>
                    <p>Select a class from the list to view attendance or generate a QR code.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
