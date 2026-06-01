import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { copyToClipboard } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const CreateSession = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  const dynamicLink = createdSession?.session?.sessionToken
    ? `${window.location.origin}/attend/${createdSession.session.sessionToken}`
    : '';

  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    latitude: '',
    longitude: '',
    address: '',
    durationMinutes: 5,
    radiusMeters: 30,
  });

  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data);
      } catch (error) {
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setLocationLoading(false);
        toast.success('Location captured successfully');
      },
      (error) => {
        toast.error('Failed to get location. Please enable location access.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!formData.classId || !formData.latitude || !formData.longitude) {
      toast.error('Please select a class and set location');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/sessions/create', {
        classId: formData.classId,
        subject: formData.subject || undefined,
        classroomLocation: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || undefined,
        },
        durationMinutes: formData.durationMinutes,
        radiusMeters: formData.radiusMeters,
      });

      setCreatedSession(res.data.data);
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (dynamicLink) {
      await copyToClipboard(dynamicLink);
      toast.success('Link copied to clipboard!');
    }
  };

  // Success state
  if (createdSession) {
    return (
      <div className="modal-overlay" onClick={onCreated}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Session Created! 🎉</h2>
          </div>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <div className="success-icon-large">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="session-link-label">Share this link with students:</p>
            <div className="session-link-box">
              <code className="session-link-text">{dynamicLink}</code>
              <button className="btn btn-primary btn-sm" onClick={handleCopyLink}>
                Copy
              </button>
            </div>
            <div className="qr-container">
              <QRCodeSVG
                value={dynamicLink}
                size={180}
                level="M"
                includeMargin={true}
                bgColor="transparent"
                fgColor="var(--color-text)"
              />
              <p className="qr-label">Scan to mark attendance</p>
            </div>
            <button className="btn btn-primary btn-lg btn-block" onClick={onCreated}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Attendance Session</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Progress indicator */}
        <div className="stepper">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step ${step >= s ? 'step-active' : ''} ${step > s ? 'step-done' : ''}`}>
              <div className="step-circle">{step > s ? '✓' : s}</div>
              <span className="step-label">{s === 1 ? 'Class' : s === 2 ? 'Location' : 'Settings'}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {/* Step 1: Select Class */}
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">Select Class *</label>
                {loading ? (
                  <p>Loading classes...</p>
                ) : classes.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No classes found. Create a class first.</p>
                  </div>
                ) : (
                  <div className="class-select-grid">
                    {classes.map((cls) => (
                      <button
                        key={cls._id}
                        className={`class-select-item ${formData.classId === cls._id ? 'class-select-active' : ''}`}
                        onClick={() => setFormData({ ...formData, classId: cls._id, subject: cls.name })}
                      >
                        <span className="class-select-code">{cls.code}</span>
                        <span className="class-select-name">{cls.name}</span>
                        <span className="class-select-count">{cls.students?.length || 0} students</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Subject (Optional Override)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., TCP/IP Protocols"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">Classroom Location *</label>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner"></span>
                      Getting location...
                    </span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      Use My Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="divider-text">or enter manually</div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="28.6139"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="77.2090"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <div className="location-preview">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span>Location set: {formData.latitude}, {formData.longitude}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Address Label (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Room 301, CS Building"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">
                  Duration: <strong>{formData.durationMinutes} minute{formData.durationMinutes !== 1 ? 's' : ''}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Radius: <strong>{formData.radiusMeters} meters</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={formData.radiusMeters}
                  onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) })}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>10m</span>
                  <span>100m</span>
                </div>
                <p className="form-hint">
                  📍 Students must be within {formData.radiusMeters}m of this location to mark attendance.
                </p>
              </div>

              {/* Summary */}
              <div className="session-summary">
                <h4>Session Summary</h4>
                <div className="summary-row">
                  <span>Class:</span>
                  <span>{classes.find(c => c._id === formData.classId)?.name || 'Not selected'}</span>
                </div>
                <div className="summary-row">
                  <span>Subject:</span>
                  <span>{formData.subject || 'Same as class name'}</span>
                </div>
                <div className="summary-row">
                  <span>Location:</span>
                  <span>{formData.latitude}, {formData.longitude}</span>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{formData.durationMinutes} min</span>
                </div>
                <div className="summary-row">
                  <span>Radius:</span>
                  <span>{formData.radiusMeters}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {step < 3 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !formData.classId || step === 2 && (!formData.latitude || !formData.longitude)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={creating}
            >
              {creating ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span>
                  Creating...
                </span>
              ) : (
                'Create Session'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSession;
