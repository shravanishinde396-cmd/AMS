import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDateTime, formatDistance } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/my-history?page=${page}&limit=10`);
      setHistory(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  if (loading && history.length === 0) return <LoadingSpinner message="Loading attendance logs..." />;

  return (
    <div className="glass-panel overflow-hidden border border-white/10 rounded-2xl shadow-xl bg-slate-900/40 backdrop-blur-md">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Attendance History</h3>
          <p className="text-sm text-gray-400 mt-1">Total sessions attended: {totalRecords}</p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
          title="Refresh logs"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <th className="p-4 pl-6">Class Code</th>
              <th className="p-4">Class / Subject</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Verification Distance</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.length > 0 ? (
              history.map((record) => (
                <tr key={record._id} className="hover:bg-white/5 transition-colors text-sm text-gray-300">
                  <td className="p-4 pl-6 font-mono font-medium text-cyan-400">
                    {record.class?.code || '—'}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-white">{record.session?.subject || 'Session'}</div>
                      <div className="text-xs text-gray-500">{record.class?.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                    {formatDateTime(record.markedAt)}
                  </td>
                  <td className="p-4 font-medium text-white">
                    {record.distanceFromClassroom !== undefined ? (
                      <span>{formatDistance(record.distanceFromClassroom)}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-4 pr-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                      PRESENT
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  You have not marked any attendance yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-950/20 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-sm font-medium text-white rounded-xl transition-all"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-sm font-medium text-white rounded-xl transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
