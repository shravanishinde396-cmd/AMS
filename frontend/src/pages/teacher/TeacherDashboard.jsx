import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { formatDateTime, copyToClipboard } from '../../utils/helpers';
import CreateSession from '../../components/teacher/CreateSession';
import SessionCard from '../../components/teacher/SessionCard';
import ClassManager from '../../components/teacher/ClassManager';
import CountdownTimer from '../../components/common/CountdownTimer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showClassManager, setShowClassManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/teacher/dashboard');
      setDashboard(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCloseSession = async (sessionId) => {
    try {
      await api.put(`/sessions/${sessionId}/close`);
      toast.success('Session closed successfully');
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close session');
    }
  };

  const handleCopyLink = async (token) => {
    const link = `${window.location.origin}/attend/${token}`;
    await copyToClipboard(link);
    toast.success('Attendance link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.name} 👋</h1>
          <p className="dashboard-subtitle">Manage your classes and attendance sessions</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowClassManager(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Manage Classes
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateSession(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Session
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.totalClasses || 0}</span>
            <span className="stat-label">Classes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.totalSessions || 0}</span>
            <span className="stat-label">Sessions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.totalStudents || 0}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${dashboard?.activeSession ? 'stat-icon-active' : 'stat-icon-gray'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.activeSession ? 'Live' : 'None'}</span>
            <span className="stat-label">Active Session</span>
          </div>
        </div>
      </div>

      {/* Active Session Banner */}
      {dashboard?.activeSession && (
        <div className="active-session-banner">
          <div className="active-session-pulse"></div>
          <div className="active-session-content">
            <div className="active-session-info">
              <h3 className="active-session-title">
                🟢 Live Session: {dashboard.activeSession.subject || dashboard.activeSession.class?.name}
              </h3>
              <p className="active-session-class">{dashboard.activeSession.class?.name} ({dashboard.activeSession.class?.code})</p>
              <div className="active-session-meta">
                <CountdownTimer expiresAt={dashboard.activeSession.expiresAt} onExpire={fetchDashboard} />
                <span className="active-session-count">
                  {dashboard.activeSession.attendanceCount} student{dashboard.activeSession.attendanceCount !== 1 ? 's' : ''} marked
                </span>
              </div>
            </div>
            <div className="active-session-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleCopyLink(dashboard.activeSession.sessionToken)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                Copy Link
              </button>
              <Link to={`/teacher/session/${dashboard.activeSession._id}`} className="btn btn-secondary btn-sm">
                View Details
              </Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleCloseSession(dashboard.activeSession._id)}
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Sessions</h2>
          <Link to="/teacher/reports" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {dashboard?.recentSessions?.length > 0 ? (
          <div className="sessions-grid">
            {dashboard.recentSessions.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p>No sessions yet. Create your first attendance session!</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateSession(true)}>
              Create Session
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateSession && (
        <CreateSession
          onClose={() => setShowCreateSession(false)}
          onCreated={() => {
            setShowCreateSession(false);
            fetchDashboard();
          }}
        />
      )}

      {showClassManager && (
        <ClassManager
          onClose={() => setShowClassManager(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
