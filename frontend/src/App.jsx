import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import SessionDetails from './pages/teacher/SessionDetails';
import Reports from './pages/teacher/Reports';
import StudentDashboard from './pages/student/StudentDashboard';
import AttendancePage from './pages/attendance/AttendancePage';

// Layout Wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

// Home Redirect Component
const HomeRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null; // Let the ProtectedRoute handle loading if needed, or render blank

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Home Route redirects based on Authentication & Role */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Attendance Link (requires auth internally to submit) */}
            <Route path="/attend/:sessionToken" element={<AttendancePage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher"
              element={<Navigate to="/teacher/dashboard" replace />}
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/session/:sessionId"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <SessionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/reports"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        
        {/* Global Toast Alerts */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
