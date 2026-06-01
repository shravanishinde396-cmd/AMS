import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDistance } from '../../utils/helpers';

const MarkAttendance = ({ sessionToken, sessionDetails, onSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle, locating, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [gpsData, setGpsData] = useState(null);
  const [distance, setDistance] = useState(null);
  const [stepMsg, setStepMsg] = useState('');

  const triggerLocationFlow = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      toast.error('Geolocation is not supported');
      return;
    }

    setStatus('locating');
    setErrorMsg('');
    setStepMsg('Requesting GPS permission & getting lock...');

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsData({ latitude, longitude, accuracy });
        setStepMsg('Location locked. Submitting coordinates to server...');
        submitAttendance(latitude, longitude, accuracy);
      },
      (error) => {
        let msg = 'Failed to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow location access in your browser settings to mark attendance.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS signal unavailable. Please ensure your device location/GPS is turned on.';
            break;
          case error.TIMEOUT:
            msg = 'GPS request timed out. Please try again or move to a more open area.';
            break;
        }
        setStatus('error');
        setErrorMsg(msg);
        toast.error('Location error: ' + error.message);
      },
      geoOptions
    );
  };

  const submitAttendance = async (latitude, longitude, accuracy) => {
    setStatus('submitting');
    try {
      const res = await api.post('/attendance/mark', {
        sessionToken,
        studentLocation: {
          latitude,
          longitude,
          accuracy,
        },
      });

      setStatus('success');
      setDistance(res.data.data.distanceFromClassroom);
      toast.success(res.data.message || 'Attendance marked successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus('error');
      const serverMsg = err.response?.data?.message || 'Proximity check failed.';
      const serverDistance = err.response?.data?.distance;
      const allowedRadius = err.response?.data?.allowed;

      if (err.response?.status === 403 && serverDistance !== undefined) {
        // Location-based rejection
        setErrorMsg(
          `Out of Proximity: You are ${formatDistance(serverDistance)} away. You must be within ${allowedRadius}m of the classroom (currently allowed range).`
        );
      } else {
        setErrorMsg(serverMsg);
      }
      toast.error(serverMsg);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {status === 'idle' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Location Verification Required</h3>
            <p className="text-sm text-gray-400 mt-2 px-4">
              To check in, you must be within {sessionDetails?.radiusMeters || 30} meters of the classroom coordinates.
            </p>
          </div>
          <button
            onClick={triggerLocationFlow}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
          >
            Verify Location & Check In
          </button>
        </div>
      )}

      {(status === 'locating' || status === 'submitting') && (
        <div className="space-y-6 py-8">
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center text-cyan-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Verifying Proximity...</h3>
            <p className="text-xs text-gray-400 mt-2 animate-pulse">{stepMsg}</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-emerald-400">Attendance Logged</h3>
            <p className="text-sm text-gray-300 mt-2">
              You are successfully marked <span className="font-semibold text-white">PRESENT</span>.
            </p>
            {distance !== null && (
              <p className="text-xs text-gray-400 mt-1">
                Verified at {formatDistance(distance)} from classroom coordinates.
              </p>
            )}
          </div>
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left">
            <div className="text-xs text-gray-500 uppercase font-semibold">Subject</div>
            <div className="text-white font-bold text-base mt-0.5">{sessionDetails?.subject}</div>
            <div className="text-xs text-gray-400 mt-1">{sessionDetails?.className} ({sessionDetails?.classCode})</div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-rose-400">Verification Failed</h3>
            <p className="text-sm text-gray-300 mt-2 px-4 leading-relaxed">
              {errorMsg}
            </p>
          </div>
          {gpsData && (
            <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-left font-mono text-[10px] text-gray-500">
              <div>lat: {gpsData.latitude.toFixed(6)}, lon: {gpsData.longitude.toFixed(6)}</div>
              <div>gps accuracy: ±{Math.round(gpsData.accuracy)}m</div>
            </div>
          )}
          <button
            onClick={triggerLocationFlow}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-2xl transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
