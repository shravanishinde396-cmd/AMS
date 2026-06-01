import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const ClassManager = ({ onClose }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', code: '', department: '' });
  const [enrollInput, setEnrollInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

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

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.code) {
      toast.error('Please provide class name and code');
      return;
    }

    setCreating(true);
    try {
      await api.post('/classes', newClass);
      toast.success('Class created successfully!');
      setNewClass({ name: '', code: '', department: '' });
      setShowCreateForm(false);
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrollInput || !selectedClass) return;

    setEnrolling(true);
    try {
      const isEmail = enrollInput.includes('@');
      const body = isEmail ? { studentEmail: enrollInput } : { rollNumber: enrollInput };
      await api.post(`/classes/${selectedClass._id}/enroll`, body);
      toast.success('Student enrolled successfully!');
      setEnrollInput('');
      fetchClasses();
      // Refresh selected class
      const res = await api.get(`/classes/${selectedClass._id}`);
      setSelectedClass(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await api.delete(`/classes/${selectedClass._id}/enroll/${studentId}`);
      toast.success('Student removed');
      const res = await api.get(`/classes/${selectedClass._id}`);
      setSelectedClass(res.data.data);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedClass ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedClass(null)} style={{ marginRight: 8 }}>←</button>
            ) : null}
            {selectedClass ? selectedClass.name : 'Manage Classes'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!selectedClass ? (
            <>
              {/* Class list */}
              <div className="class-list">
                {loading ? (
                  <p>Loading...</p>
                ) : classes.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No classes yet. Create your first class!</p>
                  </div>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="class-list-item" onClick={() => setSelectedClass(cls)}>
                      <div>
                        <span className="class-list-code">{cls.code}</span>
                        <span className="class-list-name">{cls.name}</span>
                      </div>
                      <span className="class-list-count">{cls.students?.length || 0} students →</span>
                    </div>
                  ))
                )}
              </div>

              {/* Create class form */}
              {showCreateForm ? (
                <form onSubmit={handleCreateClass} className="create-class-form">
                  <h4>New Class</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Class name (e.g., Data Structures)"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Code (e.g., CS201)"
                      value={newClass.code}
                      onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                      required
                      style={{ maxWidth: 140 }}
                    />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Department (optional)"
                    value={newClass.department}
                    onChange={(e) => setNewClass({ ...newClass, department: e.target.value })}
                  />
                  <div className="form-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                      {creating ? 'Creating...' : 'Create Class'}
                    </button>
                  </div>
                </form>
              ) : (
                <button className="btn btn-primary btn-block" onClick={() => setShowCreateForm(true)}>
                  + Create New Class
                </button>
              )}
            </>
          ) : (
            <>
              {/* Selected class details */}
              <div className="class-detail-info">
                <span className="badge badge-primary">{selectedClass.code}</span>
                <span>{selectedClass.department || 'No department'}</span>
              </div>

              {/* Enroll student */}
              <form onSubmit={handleEnrollStudent} className="enroll-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Student email or roll number"
                  value={enrollInput}
                  onChange={(e) => setEnrollInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={enrolling || !enrollInput}>
                  {enrolling ? 'Adding...' : 'Add Student'}
                </button>
              </form>

              {/* Student list */}
              <div className="student-list">
                <h4>Enrolled Students ({selectedClass.students?.length || 0})</h4>
                {selectedClass.students?.length > 0 ? (
                  selectedClass.students.map((student) => (
                    <div key={student._id} className="student-list-item">
                      <div className="student-info">
                        <span className="student-name">{student.name}</span>
                        <span className="student-meta">{student.rollNumber} · {student.email}</span>
                      </div>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleRemoveStudent(student._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No students enrolled yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassManager;
