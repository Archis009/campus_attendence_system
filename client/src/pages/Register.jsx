import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(name, email, password, role);
      setLoading(false);
      if (data.role === "student") navigate("/student");
      else if (data.role === "teacher") navigate("/teacher");
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.error || error.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
        {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1e3a8a 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col items-center p-8 sm:p-10">
        
        <div className="w-full text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-900 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
           </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join the campus attendance platform today</p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
           <div className="group">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-gray-900 transition-all placeholder-gray-400"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-gray-900 transition-all placeholder-gray-400"
              placeholder="student@university.edu"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-gray-900 transition-all placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

           <div className="group">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">I am a...</label>
            <div className="relative">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-gray-900 transition-all appearance-none cursor-pointer"
                    >
                    <option value="student" className="text-gray-900">Student</option>
                    <option value="teacher" className="text-gray-900">Teacher</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
             className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
             {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center w-full">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-900 hover:text-blue-700 font-semibold transition-colors inline-flex items-center gap-1 group"
            >
              Log In
               <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
