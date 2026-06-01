import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import AttendanceHistory from '../../components/student/AttendanceHistory';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');

  const handlePasteShortcut = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast.warning('Please enter a session token or link');
      return;
    }

    let token = tokenInput.trim();
    // Support pasting the full URL (e.g. http://localhost:5173/attend/123-abc)
    if (token.includes('/attend/')) {
      const parts = token.split('/attend/');
      token = parts[parts.length - 1];
    }

    if (token) {
      navigate(`/attend/${token}`);
    } else {
      toast.error('Could not extract a valid session token from input');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-400 mt-1">Keep track of your classes and verify your attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profile Card */}
        <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
                {user?.name ? user.name[0].toUpperCase() : '?'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Student Profile</h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Verified Student</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Roll Number</span>
                <span className="text-base font-semibold text-cyan-400 font-mono">{user?.rollNumber || 'Not assigned'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Department</span>
                <span className="text-sm text-gray-200 font-medium">{user?.department || 'General'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Email</span>
                <span className="text-sm text-gray-300 truncate block">{user?.email}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>AttendX Account Status</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        {/* Quick Check-In Card */}
        <div className="lg:col-span-2 glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex flex-col justify-between">
          <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Quick Attendance Check-In</h3>
              <p className="text-sm text-gray-400">
                Have an attendance token or class link? Paste it below to start your location-verified check-in.
              </p>
            </div>
            <div className="text-gray-500 p-2 bg-white/5 rounded-xl border border-white/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
          </div>
          
          <form onSubmit={handlePasteShortcut} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow flex-1">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste code (e.g. UUID) or class check-in link here..."
                className="w-full pl-4 pr-11 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
              <div className="absolute right-3.5 top-3.5 text-gray-500 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary px-6 py-3 font-semibold rounded-xl text-sm"
            >
              Go to Check-In
            </button>
          </form>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Must enable browser GPS permissions for location verification to pass.
          </div>
        </div>
      </div>

      {/* Renders Attendance history */}
      <AttendanceHistory />
    </div>
  );
};

export default StudentDashboard;
