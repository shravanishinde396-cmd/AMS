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
            <h3 className="text-lg font-bold text-white mb-4">Student Profile</h3>
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
            <span>Verified Student</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Quick Check-In Card */}
        <div className="lg:col-span-2 glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Quick Attendance Check-In</h3>
            <p className="text-sm text-gray-400">
              Have an attendance token or class link? Paste it below to start your location-verified check-in.
            </p>
            <form onSubmit={handlePasteShortcut} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste code (e.g. UUID) or class check-in link here..."
                className="flex-1 px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
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
