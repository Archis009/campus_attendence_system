import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      setLoading(false);
      if (data.role === "student") navigate("/student");
      else if (data.role === "teacher") navigate("/teacher");
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "Invalid credentials or server error";
      setError(message);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1e3a8a 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col items-center p-8 sm:p-10">
        
        <div className="w-full text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-900 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
           </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Please sign in to continue</p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
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
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-gray-900 transition-all placeholder-gray-400 pr-12"
                    placeholder="••••••••"
                    required
                />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showPassword ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    )}
                </button>
            </div>
            <div className="flex justify-end mt-2">
                 <Link to="#" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">Forgot Password?</Link>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center w-full">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-900 hover:text-blue-700 font-semibold transition-colors inline-flex items-center gap-1 group"
            >
              Create Account
               <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;