import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/helpers';

const SessionCard = ({ session }) => {
  const isActive = session.isActive && new Date(session.expiresAt) > Date.now();
  const isExpired = !session.isActive || new Date(session.expiresAt) <= Date.now();

  return (
    <Link to={`/teacher/session/${session._id}`} className="session-card">
      <div className="session-card-header">
        <div className="session-card-badge-row">
          <span className={`badge ${isActive ? 'badge-success' : 'badge-default'}`}>
            {isActive ? (
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                Closed
              </span>
            )}
          </span>
          <span className="session-card-code">{session.class?.code}</span>
        </div>
        <h3 className="session-card-title">{session.subject || session.class?.name}</h3>
        <p className="session-card-class">{session.class?.name}</p>
      </div>
      <div className="session-card-footer">
        <span className="session-card-date">{formatDateTime(session.startTime)}</span>
        <span className="session-card-attendance bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          {session.attendanceCount}
        </span>
      </div>
    </Link>
  );
};

export default SessionCard;
