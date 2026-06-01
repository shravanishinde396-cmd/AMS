import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    rollNumber: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, role, rollNumber, department } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !rollNumber) {
      toast.error('Roll number is required for students');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({ name, email, password, role, rollNumber, department });
      toast.success(`Welcome to AttendX, ${user.name}!`);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-shape auth-bg-shape-1"></div>
        <div className="auth-bg-shape auth-bg-shape-2"></div>
        <div className="auth-bg-shape auth-bg-shape-3"></div>
      </div>

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join AttendX and get started</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'role-btn-active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'student' })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Student
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'teacher' ? 'role-btn-active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'teacher' })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Teacher
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                <input
                  id="rollNumber"
                  type="text"
                  name="rollNumber"
                  className="form-input"
                  placeholder="CS2101"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department" className="form-label">Department (Optional)</label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {formData.role === 'teacher' && (
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department (Optional)</label>
              <input
                id="department"
                type="text"
                name="department"
                className="form-input"
                placeholder="Computer Science"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
