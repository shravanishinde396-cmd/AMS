import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDateTime, copyToClipboard, formatDistance } from '../../utils/helpers';
import AttendanceReport from '../../components/teacher/AttendanceReport';
import CountdownTimer from '../../components/common/CountdownTimer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  
  const dynamicLink = session ? `${window.location.origin}/attend/${session.sessionToken}` : '';
  
  const refreshIntervalRef = useRef(null);

  const fetchSessionData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch Session details with present records
      const sessionRes = await api.get(`/sessions/${sessionId}`);
      const { session: sess, attendance: att } = sessionRes.data.data;
      
      setSession(sess);
      setAttendanceRecords(att);

      // 2. Fetch Class details to get full list of enrolled students for absent computation
      if (sess?.class?._id) {
        const classRes = await api.get(`/classes/${sess.class._id}`);
        setEnrolledStudents(classRes.data.data.students || []);
      }
    } catch (error) {
      toast.error('Failed to load session details');
      if (!isSilent) navigate('/teacher');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessionData();

    // Set up auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchSessionData(true);
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [sessionId]);

  const handleCloseSession = async () => {
    try {
      await api.put(`/sessions/${sessionId}/close`);
      toast.success('Session closed successfully');
      fetchSessionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close session');
    }
  };

  const handleCopyLink = async () => {
    if (!dynamicLink) return;
    await copyToClipboard(dynamicLink);
    toast.success('Attendance link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner message="Loading session details..." />;
  if (!session) return <div className="text-center p-8 text-white">Session not found.</div>;

  // Merge enrolled students with attendance records to mark "present" or "absent"
  const presentStudentIds = new Set(attendanceRecords.map(r => r.student?._id || r.student));
  
  const consolidatedReport = enrolledStudents.map(student => {
    const presentRecord = attendanceRecords.find(
      r => (r.student?._id || r.student) === student._id
    );

    if (presentRecord) {
      return {
        student,
        status: 'present',
        markedAt: presentRecord.markedAt,
        distance: presentRecord.distanceFromClassroom,
        accuracy: presentRecord.studentLocation?.accuracy,
        deviceFingerprint: {
          ip: presentRecord.ipAddress,
          device: presentRecord.deviceInfo,
        }
      };
    } else {
      return {
        student,
        status: 'absent',
        markedAt: null,
        distance: null,
        deviceFingerprint: null
      };
    }
  });

  // Calculate stats
  const totalEnrolled = enrolledStudents.length;
  const totalPresent = attendanceRecords.length;
  const totalAbsent = Math.max(0, totalEnrolled - totalPresent);
  const attendanceRate = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

  const isLive = session.isActive && new Date(session.expiresAt) > Date.now();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back breadcrumb */}
      <div className="mb-6">
        <Link to="/teacher" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <div className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              {session.class?.code}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isLive 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 active-pulse' 
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}>
              {isLive ? '● LIVE NOW' : 'CLOSED'}
            </span>
            {refreshing && (
              <span className="text-xs text-gray-400 animate-pulse">
                Refreshing data...
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{session.subject}</h1>
          <p className="text-gray-400 mt-1">Class: {session.class?.name}</p>
          <p className="text-xs text-gray-500 mt-2">Created on {formatDateTime(session.startTime)}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isLive && (
            <button onClick={handleCloseSession} className="btn btn-danger flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              Close Session
            </button>
          )}
          <button onClick={() => fetchSessionData(true)} className="btn btn-secondary flex items-center gap-2">
            <svg className={refreshing ? 'animate-spin' : ''} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Middle Layout: QR Code + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Cols: Info & QR */}
        <div className="lg:col-span-2 space-y-8">
          {isLive && (
            <div className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-md flex flex-col md:flex-row items-center gap-8">
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-cyan-500/5 hover:scale-105 transition-transform">
                <QRCodeSVG value={dynamicLink} size={180} level="H" />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h3 className="text-lg font-bold text-white">Share QR or Link</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Project this QR code or share the attendance link with your students.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/40 border border-white/5 rounded-xl p-3 pr-2 select-all font-mono text-xs text-cyan-400 break-all">
                  <span className="flex-1 text-left truncate">{dynamicLink}</span>
                  <button onClick={handleCopyLink} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="text-left">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Time Remaining</span>
                    <CountdownTimer expiresAt={session.expiresAt} onExpire={fetchSessionData} />
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-left">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">Location Radius</span>
                    <span className="text-lg font-bold text-white">{session.radiusMeters} meters</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Location Card */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">Location Boundary Verification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/20 border border-white/5 rounded-xl">
                <span className="text-xs text-gray-500 block">Classroom Coordinates</span>
                <span className="text-sm font-mono text-white mt-1 block">
                  {session.classroomLocation?.latitude?.toFixed(6)}, {session.classroomLocation?.longitude?.toFixed(6)}
                </span>
              </div>
              <div className="p-4 bg-slate-950/20 border border-white/5 rounded-xl">
                <span className="text-xs text-gray-500 block">Location Address</span>
                <span className="text-sm text-gray-300 mt-1 block truncate">
                  {session.classroomLocation?.address || 'Geocoded classroom location'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Metrics Grid */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Enrolled Students</span>
              <span className="text-3xl font-extrabold text-white mt-1 block">{totalEnrolled}</span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Present</span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{totalPresent}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Absent</span>
              <span className="text-3xl font-extrabold text-rose-400 mt-1 block">{totalAbsent}</span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Attendance Rate</span>
              <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">{attendanceRate}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin-slow flex items-center justify-center text-[10px] font-bold text-cyan-400">
              {attendanceRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Consolidated Attendance Report */}
      <AttendanceReport
        type="session"
        data={consolidatedReport}
        title="Student Attendance Roll Call"
        extraInfo={`Present: ${totalPresent} / Enrolled: ${totalEnrolled}`}
      />
    </div>
  );
};

export default SessionDetails;
