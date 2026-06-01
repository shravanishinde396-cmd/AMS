import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import MarkAttendance from '../../components/student/MarkAttendance';
import CountdownTimer from '../../components/common/CountdownTimer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AttendancePage = () => {
  const { sessionToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'not_found', 'inactive', 'expired', 'error'

  const fetchSessionInfo = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const res = await api.get(`/sessions/link/${sessionToken}`);
      const data = res.data.data;
      
      setSessionDetails(data);

      if (!data.isActive) {
        setErrorType('inactive');
      } else if (data.isExpired || new Date(data.expiresAt) < Date.now()) {
        setErrorType('expired');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setErrorType('not_found');
      } else {
        setErrorType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionInfo();
  }, [sessionToken]);

  if (loading) return <LoadingSpinner message="Validating check-in session..." />;

  // 1. Session is not found or error occurred
  if (errorType === 'not_found' || !sessionDetails) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Invalid Attendance Link</h2>
          <p className="text-gray-400 mt-3 leading-relaxed">
            The session link is invalid, does not exist, or has been deleted by the teacher.
          </p>
          <div className="mt-8">
            <Link to="/" className="btn btn-primary w-full py-3">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Session is inactive or expired
  if (errorType === 'inactive' || errorType === 'expired') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Session Closed</h2>
          <p className="text-gray-400 mt-3 leading-relaxed">
            This attendance session has already ended or was closed by the instructor.
          </p>
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left mt-6">
            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Subject</span>
            <span className="text-white font-bold block">{sessionDetails.subject}</span>
            <span className="text-xs text-gray-400 mt-1 block">{sessionDetails.className} ({sessionDetails.classCode})</span>
          </div>
          <div className="mt-8">
            <Link to="/" className="btn btn-secondary w-full py-3">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is unauthenticated — show session info + login/register actions
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full inline-block mb-3 animate-pulse">
              ● Active Check-In Session
            </span>
            <h2 className="text-2xl font-extrabold text-white">{sessionDetails.subject}</h2>
            <p className="text-sm text-gray-400 mt-1">{sessionDetails.className}</p>
          </div>

          <div className="space-y-4 my-6 bg-slate-950/40 p-4 border border-white/5 rounded-2xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Instructor:</span>
              <span className="text-white font-semibold">{sessionDetails.teacherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Class Radius:</span>
              <span className="text-white font-semibold">{sessionDetails.radiusMeters}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Time Remaining:</span>
              <CountdownTimer expiresAt={sessionDetails.expiresAt} onExpire={fetchSessionInfo} />
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={`/login?redirect=/attend/${sessionToken}`}
              className="btn btn-primary w-full py-3.5 block text-center font-bold text-sm rounded-xl"
            >
              Sign In to Mark Attendance
            </Link>
            <Link
              to={`/register?redirect=/attend/${sessionToken}`}
              className="btn btn-secondary w-full py-3.5 block text-center font-medium text-sm rounded-xl"
            >
              New here? Register Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. User is authenticated as Teacher (cannot check in)
  if (user?.role === 'teacher') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Teacher Account Detected</h2>
          <p className="text-gray-400 mt-3 leading-relaxed">
            Instructors cannot check into class attendance sessions.
          </p>
          <div className="mt-8 space-y-3">
            <Link to="/teacher" className="btn btn-primary w-full py-3 block">
              Go to Instructor Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                navigate(`/login?redirect=/attend/${sessionToken}`);
              }}
              className="btn btn-ghost w-full py-3 text-sm"
            >
              Switch Account / Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. User is authenticated as Student — show the geolocation check-in flow
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Active Session</span>
            <h2 className="text-xl font-bold text-white leading-tight mt-0.5">{sessionDetails.subject}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{sessionDetails.className} ({sessionDetails.classCode})</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Time Left</span>
            <CountdownTimer expiresAt={sessionDetails.expiresAt} onExpire={fetchSessionInfo} />
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-6"></div>

        {/* Geolocation check-in module */}
        <MarkAttendance
          sessionToken={sessionToken}
          sessionDetails={sessionDetails}
          onSuccess={() => {
            // Can trigger additional events, e.g. delay redirect back to dashboard after 5s
          }}
        />

        <div className="w-full h-px bg-white/10 my-6"></div>

        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Signed in as <span className="font-semibold text-white">{user?.name}</span></span>
          <button
            onClick={() => {
              logout();
              navigate(`/login?redirect=/attend/${sessionToken}`);
            }}
            className="text-cyan-400 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
