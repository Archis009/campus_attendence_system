import { useState, useEffect } from "react";
import api from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classIdToJoin, setClassIdToJoin] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchAvailableClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      const { data } = await api.get(
        "/api/classes/available"
      );
      setAvailableClasses(data);
    } catch (error) {
      console.error("Error fetching available classes", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(
        "/api/attendance/history"
      );
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
        setLoadingHistory(false);
    }
  };

  const joinClass = async (e, codeOverride = null) => {
    if (e) e.preventDefault();
    const code = codeOverride || classIdToJoin;
    
    setMsg("");
    try {
      await api.post(
        `/api/classes/enroll`,
        { code }
      );
      setMsg("Successfully enrolled & marked present!");
      setClassIdToJoin("");
      fetchHistory(); // Update attendance history
      fetchAvailableClasses(); // Remove from available list
    } catch (error) {
      setMsg(error.response?.data?.message || "Error joining class");
    }
  };

  const markAttendance = async (tokenData) => {
    try {
      const { data } = await api.post(
        "/api/attendance/mark",
        { token: tokenData }
      );
      setMsg(data.message);
      fetchHistory();
    } catch (error) {
      setMsg(error.response?.data?.message || "Error marking attendance");
    }
  };

  useEffect(() => {
    // Small timeout to ensure DOM is ready and prevent potential double-init issues in strict mode
    const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
      
          const onScanSuccess = (decodedText) => {
            scanner.clear(); // Stop scanning after success to prevent multiple triggers
            markAttendance(decodedText);
          };
      
          const onScanFailure = () => {
            // handle scan failure, usually better to ignore and keep scanning.
          };
      
          scanner.render(onScanSuccess, onScanFailure);
          
          return () => {
              scanner.clear().catch(err => console.error("Scanner clear error", err));
          };
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                    S
                 </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Student Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-gray-300">
                Welcome, <span className="font-semibold text-white">{user?.name}</span>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
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
          
          {/* Left Column: Actions & Scanner */}
          <div className="lg:col-span-5 space-y-8">
             {/* Enroll Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Join by Code
              </h2>
              <form onSubmit={joinClass} className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Class Code"
                    className="flex-1 bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 uppercase font-mono"
                    value={classIdToJoin}
                    onChange={(e) => setClassIdToJoin(e.target.value.toUpperCase())}
                    required
                  />
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/20">
                    Join
                  </button>
                </div>
              </form>
            </div>

            {/* Available Classes List */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Available Classes
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {availableClasses.length === 0 ? (
                      <p className="text-gray-500 text-sm">No new classes available.</p>
                  ) : (
                      availableClasses.map((cls) => (
                          <div key={cls._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700/30 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors gap-3">
                              <div className="flex justify-between items-start mb-2 w-full sm:w-auto">
                                <div>
                                  <h3 className="font-bold text-white text-lg">{cls.className}</h3>
                                  <p className="text-gray-400 text-sm">Teacher: {cls.teacherId?.name || "Unknown"}</p>
                                  {cls.startTime && cls.endTime && (
                                      <p className="text-xs text-blue-400 mt-1">
                                          Today: {cls.startTime} - {cls.endTime}
                                      </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">Code:</span>
                                    <code className="bg-gray-900 px-2 py-0.5 rounded text-xs text-blue-300 font-mono tracking-wider">{cls.code}</code>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(cls.code)}
                                      className="text-xs text-gray-500 hover:text-white transition-colors"
                                      title="Copy Code"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </button>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => joinClass(null, cls.code)}
                                  className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded hover:bg-blue-600 hover:text-white transition-all border border-blue-600/30"
                                >
                                  Quick Join
                                </button>
                              </div>

                          </div>
                      ))
                  )}
              </div>
            </div>

            {/* Scanner Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        Scan Attendance
                    </h2>
                    {msg && (
                        <span className={`text-sm px-3 py-1 rounded-full ${msg.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                            {msg}
                        </span>
                    )}
                </div>
              
              <div className="bg-black/50 rounded-xl overflow-hidden border border-gray-600/50">
                 {/* The scanner library will inject standard HTML here, customization is limited via CSS */}
                <div id="reader" className="w-full"></div>
              </div>
              <p className="mt-4 text-center text-sm text-gray-400">
                  Allow camera access to scan teacher's QR code
              </p>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-7">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg min-h-[500px]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Attendance History
              </h2>
              
              {loadingHistory ? (
                   <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                   </div>
              ) : (
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                             <p>No attendance records found.</p>
                        </div>
                    ) : (
                        history.map((record) => (
                        <div
                            key={record._id}
                            className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors flex justify-between items-center group"
                        >
                            <div>
                                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    {record.classId?.className || "Unknown Class"}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {new Date(record.date).toLocaleDateString(undefined, {
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                    })}
                                    <span className="mx-2">•</span>
                                    {new Date(record.date).toLocaleTimeString(undefined, {
                                        hour: '2-digit', 
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === "Present" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}>
                                {record.status}
                            </span>
                        </div>
                        ))
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
       <style>{`
        /* Custom Reader Styles */
        #reader { border: none !important; }
        #reader video { object-fit: cover; border-radius: 0.75rem; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
