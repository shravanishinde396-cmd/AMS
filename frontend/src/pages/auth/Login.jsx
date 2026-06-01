import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] w-full flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Panel: Visual/Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-orbs flex-col justify-center px-16 border-r border-white/5 select-none">
        <div className="relative z-10 max-w-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0053db] flex items-center justify-center text-white shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#4cd7f6] to-[#b4c5ff] bg-clip-text text-transparent tracking-tight">AttendX</span>
          </div>
          <h1 className="text-5xl font-bold text-[#dee3e6] mb-6 leading-tight">
            Precision Presence. <br/> Verified Instantly.
          </h1>
          <p className="text-lg text-[#bcc9cd] mb-12">
            The enterprise-grade attendance platform engineered for real-time accuracy and indisputable verification.
          </p>
          <ul className="space-y-6">
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#4cd7f6] border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <span className="text-[#dee3e6] font-medium">GPS-verified check-in</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#4cd7f6] border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <span className="text-[#dee3e6] font-medium">Real-time sessions</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#4cd7f6] border border-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              </div>
              <span className="text-[#dee3e6] font-medium">Instant reports</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative min-h-[90vh]">
        {/* Background dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: -20,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0053db] flex items-center justify-center text-white shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#4cd7f6] to-[#b4c5ff] bg-clip-text text-transparent tracking-tight">AttendX</span>
        </div>

        <div className="auth-card relative">
          {/* Subtle top highlight for glass effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#dee3e6]">Sign in to AttendX</h2>
            <p className="text-sm text-[#bcc9cd] mt-2">Enter your credentials to access the portal</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                type="email"
                className="form-input form-input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Create Account</Link></p>
        </div>

        <div className="auth-demo">
          <p className="auth-demo-title">Demo Credentials</p>
          <div className="auth-demo-grid">
            <button type="button" className="auth-demo-btn" onClick={() => { setEmail('teacher@demo.com'); setPassword('Teacher@123'); }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="auth-demo-role">Teacher</span>
              </span>
              <span className="auth-demo-email">teacher@demo.com</span>
            </button>
            <button type="button" className="auth-demo-btn" onClick={() => { setEmail('student1@demo.com'); setPassword('Student@123'); }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="auth-demo-role">Student</span>
              </span>
              <span className="auth-demo-email">student1@demo.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
