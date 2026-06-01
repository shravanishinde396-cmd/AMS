import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo navbar-logo-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="navbar-title tracking-tight" style={{ letterSpacing: '-0.02em' }}>AttendX</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {isAuthenticated && user ? (
            <>
              {user.role === 'teacher' && (
                <>
                  <NavLink to="/teacher/dashboard" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>Dashboard</NavLink>
                  <NavLink to="/teacher/reports" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>Reports</NavLink>
                </>
              )}
              {user.role === 'student' && (
                <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>Dashboard</NavLink>
              )}
              <div className="navbar-user">
                <div className="navbar-avatar">{getInitials(user.name)}</div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user.name}</span>
                  <span className="navbar-user-role">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar-mobile">
          {isAuthenticated && user ? (
            <>
              <div className="navbar-mobile-user">
                <div className="navbar-avatar">{getInitials(user.name)}</div>
                <div>
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role}</div>
                </div>
              </div>
              {user.role === 'teacher' && (
                <>
                  <Link to="/teacher/dashboard" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/teacher/reports" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>Reports</Link>
                </>
              )}
              {user.role === 'student' && (
                <Link to="/student/dashboard" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-ghost" style={{ width: '100%' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
