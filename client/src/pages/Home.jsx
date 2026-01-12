import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-blue-900 p-1.5 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                CampusAccess
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1e3a8a 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <span className="text-sm font-medium text-blue-900">
              New: Real-time Attendance Analytics
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Campus Attendance <br/>
            <span className="text-blue-900">Reimagined.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            Enhance academic engagement with our secure, lightning-fast QR attendance system. 
            Designed for modern campuses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 text-lg font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-900/10"
            >
              Start using for free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-900 hover:text-blue-900 transition-all"
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Top Institutions Choose Us</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Streamline your administrative tasks and focus on what matters most—education.</p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Instant QR Scanning",
                desc: "Mark attendance in under 2 seconds. Our optimized scanner works in all lighting conditions.",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                ),
                color: "bg-blue-100 text-blue-700",
              },
              {
                title: "Live Analytics",
                desc: "Real-time dashboards provide instant insights into student participation and trends.",
                icon: (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                ),
                color: "bg-indigo-100 text-indigo-700",
              },
              {
                title: "Enterprise Grade Security",
                desc: "Your data is protected with end-to-end encryption and compliance standards.",
                icon: (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                ),
                color: "bg-emerald-100 text-emerald-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="bg-gray-900 p-1 rounded-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
            <span className="font-semibold text-gray-900">CampusAccess</span>
          </div>
          <p className="text-sm">© 2024 Campus Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
