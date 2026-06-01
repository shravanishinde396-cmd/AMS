import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';
import AttendanceReport from '../../components/teacher/AttendanceReport';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Fetch all classes for the selector
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedClassId(res.data.data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load classes');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch report data when selected class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await api.get(`/attendance/report/${selectedClassId}`);
        setReportData(res.data.data);
      } catch (error) {
        toast.error('Failed to load class report');
        setReportData(null);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchReport();
  }, [selectedClassId]);

  if (loadingClasses) return <LoadingSpinner message="Loading classes..." />;

  // Map student report data for the AttendanceReport component
  const mappedStudentData = reportData?.attendanceByStudent?.map((s) => ({
    student: {
      name: s.name,
      email: s.email,
      rollNumber: s.rollNumber,
    },
    presentCount: s.present,
    totalSessions: s.total,
  })) || [];

  // Map session data for Recharts
  const chartData = reportData?.attendanceBySession?.map((sess) => {
    const date = new Date(sess.date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const pct = sess.total > 0 ? Math.round((sess.present / sess.total) * 100) : 0;
    
    return {
      sessionName: sess.subject || formattedDate,
      date: formattedDate,
      present: sess.present,
      total: sess.total,
      percentage: pct,
    };
  }).reverse() || []; // Reverse to show chronological order (oldest to newest)

  // Calculate averages
  const avgAttendance = mappedStudentData.length > 0
    ? Math.round(
        mappedStudentData.reduce((acc, curr) => {
          const pct = curr.totalSessions > 0 ? (curr.presentCount / curr.totalSessions) * 100 : 0;
          return acc + pct;
        }, 0) / mappedStudentData.length
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Link to="/teacher" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 mb-2">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance Analytics</h1>
          <p className="text-gray-400">View performance trends and download CSV reports</p>
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="class-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Class
          </label>
          {classes.length > 0 ? (
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-400">No classes created yet.</div>
          )}
        </div>
      </div>

      {loadingReport ? (
        <LoadingSpinner message="Calculating analytics..." />
      ) : reportData ? (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">Total Sessions Conducted</span>
              <span className="text-4xl font-extrabold text-white mt-2 block">{reportData.totalSessions}</span>
            </div>
            <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">Enrolled Students</span>
              <span className="text-4xl font-extrabold text-cyan-400 mt-2 block">{reportData.totalStudents}</span>
            </div>
            <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">Average Attendance Rate</span>
              <span className={`text-4xl font-extrabold mt-2 block ${
                avgAttendance >= 85 ? 'text-emerald-400' : avgAttendance >= 75 ? 'text-yellow-400' : 'text-rose-400'
              }`}>{avgAttendance}%</span>
            </div>
          </div>

          {/* Charts Row */}
          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Turnout per Session (Bar Chart) */}
              <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">Student Turnout per Session</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="sessionName" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar name="Students Present" dataKey="present" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Rate Trend (Line Chart) */}
              <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">Attendance Performance Trend</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Line
                        name="Attendance Rate"
                        type="monotone"
                        dataKey="percentage"
                        stroke="#10b981"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md text-center text-gray-500">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 opacity-30">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="17" x2="9" y2="9" />
                <line x1="13" y1="17" x2="13" y2="13" />
                <line x1="17" y1="17" x2="17" y2="11" />
              </svg>
              No sessions conducted yet to plot chart data.
            </div>
          )}

          {/* Student Roster Report Table */}
          <AttendanceReport
            type="class"
            data={mappedStudentData}
            title="Student Roster Performance Summaries"
            extraInfo={`Class: ${reportData.className} | Average attendance: ${avgAttendance}%`}
          />
        </div>
      ) : (
        <div className="glass-panel p-12 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md text-center text-gray-500">
          No report data. Select a class to view report details.
        </div>
      )}
    </div>
  );
};

export default Reports;
