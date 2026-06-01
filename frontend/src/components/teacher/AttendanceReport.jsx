import { useState } from 'react';
import { generateCSV, formatDate, formatDateTime, formatDistance, calcPercentage } from '../../utils/helpers';

const AttendanceReport = ({ type, data, title, extraInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!data || data.length === 0) {
    return (
      <div className="card text-center p-8">
        <p className="text-gray-400">No attendance data available.</p>
      </div>
    );
  }

  // Filter logic
  const filteredData = data.filter((item) => {
    // For session reports, item is typically { student: { name, email, rollNumber }, status, markedAt, distance, deviceFingerprint }
    // For class reports, item is typically { student: { name, email, rollNumber }, presentCount, totalSessions, percentage }
    const student = item.student || {};
    const name = student.name?.toLowerCase() || '';
    const email = student.email?.toLowerCase() || '';
    const rollNumber = student.rollNumber?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(query) || email.includes(query) || rollNumber.includes(query);

    if (type === 'session') {
      const matchesStatus =
        statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }

    return matchesSearch;
  });

  const handleExport = () => {
    if (type === 'session') {
      const headers = ['Roll Number', 'Name', 'Email', 'Status', 'Marked At', 'Distance', 'Device IP'];
      const rows = filteredData.map((item) => [
        item.student?.rollNumber || 'N/A',
        item.student?.name || 'N/A',
        item.student?.email || 'N/A',
        item.status,
        item.markedAt ? formatDateTime(item.markedAt) : 'N/A',
        item.distance !== undefined ? formatDistance(item.distance) : 'N/A',
        item.deviceFingerprint?.ip || 'N/A',
      ]);
      generateCSV(headers, rows, `session_report_${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    } else {
      const headers = ['Roll Number', 'Name', 'Email', 'Sessions Present', 'Total Sessions', 'Attendance %'];
      const rows = filteredData.map((item) => [
        item.student?.rollNumber || 'N/A',
        item.student?.name || 'N/A',
        item.student?.email || 'N/A',
        item.presentCount,
        item.totalSessions,
        `${calcPercentage(item.presentCount, item.totalSessions)}%`,
      ]);
      generateCSV(headers, rows, `class_report_${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    }
  };

  return (
    <div className="glass-panel overflow-hidden border border-white/10 rounded-2xl shadow-xl bg-slate-900/40 backdrop-blur-md">
      {/* Header section */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {extraInfo && <p className="text-sm text-gray-400 mt-1">{extraInfo}</p>}
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center gap-2 self-end md:self-auto text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="p-6 bg-slate-950/20 border-b border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 text-gray-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {type === 'session' && (
          <div className="flex gap-2">
            {['all', 'present', 'absent'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === filter
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6">Roll Number</th>
              <th className="p-4">Student</th>
              {type === 'session' ? (
                <>
                  <th className="p-4">Status</th>
                  <th className="p-4">Marked At</th>
                  <th className="p-4">Accuracy / Distance</th>
                  <th className="p-4 pr-6">IP Address</th>
                </>
              ) : (
                <>
                  <th className="p-4 text-center">Present Sessions</th>
                  <th className="p-4 text-center">Total Sessions</th>
                  <th className="p-4 pr-6 text-right">Attendance Rate</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const student = item.student || {};
                return (
                  <tr
                    key={student._id || idx}
                    className="hover:bg-white/5 transition-colors text-sm text-gray-300"
                  >
                    <td className="p-4 pl-6 font-mono font-medium text-cyan-400">
                      {student.rollNumber || '—'}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-white">{student.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    {type === 'session' ? (
                      <>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                              item.status === 'present'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 height-1.5 rounded-full mr-1.5 ${
                                item.status === 'present' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            ></span>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">
                          {item.markedAt ? formatDateTime(item.markedAt) : '—'}
                        </td>
                        <td className="p-4">
                          {item.status === 'present' ? (
                            <div>
                              <div className="text-white font-medium">{formatDistance(item.distance)}</div>
                              {item.accuracy && (
                                <div className="text-xs text-gray-500">
                                  accuracy: ±{Math.round(item.accuracy)}m
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 font-mono text-xs text-gray-400">
                          {item.deviceFingerprint?.ip || '—'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-center font-semibold text-white">
                          {item.presentCount}
                        </td>
                        <td className="p-4 text-center text-gray-400">{item.totalSessions}</td>
                        <td className="p-4 pr-6 text-right">
                          {(() => {
                            const pct = calcPercentage(item.presentCount, item.totalSessions);
                            let color = 'text-rose-400';
                            if (pct >= 85) color = 'text-emerald-400';
                            else if (pct >= 75) color = 'text-yellow-400';
                            return (
                              <span className={`font-bold ${color}`}>
                                {pct}%
                              </span>
                            );
                          })()}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={type === 'session' ? 6 : 5}
                  className="p-8 text-center text-gray-500"
                >
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport;
