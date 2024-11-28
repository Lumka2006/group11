import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InstituteDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newFaculty, setNewFaculty] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [errorApplications, setErrorApplications] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // Fetch institutions
  useEffect(() => {
    fetch('http://localhost:5000/institutes')
      .then((res) => res.json())
      .then((data) => setInstitutions(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch faculties and applications based on the selected institution
  useEffect(() => {
    if (selectedInstitution) {
      fetch(`http://localhost:5000/faculties/${selectedInstitution}`)
        .then((res) => res.json())
        .then((data) => setFaculties(data))
        .catch((err) => console.error(err));

      fetch(`http://localhost:5000/applications/institution/${selectedInstitution}`)
        .then((res) => res.json())
        .then((data) => setApplications(data))
        .catch((err) => setErrorApplications(err.message))
        .finally(() => setLoadingApplications(false));
    } else {
      setFaculties([]);
      setApplications([]);
    }
  }, [selectedInstitution]);

  // Fetch courses based on the selected faculty
  useEffect(() => {
    if (selectedFaculty) {
      fetch(`http://localhost:5000/courses/${selectedFaculty}`)
        .then((res) => res.json())
        .then((data) => setCourses(data))
        .catch((err) => console.error(err));
    } else {
      setCourses([]);
    }
  }, [selectedFaculty]);

  // Helper functions for faculty, course, and application management
  const handleAddFaculty = () => {
    if (!newFaculty.trim()) return;
    fetch('http://localhost:5000/addFaculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionId: selectedInstitution,
        facultyName: newFaculty,
      }),
    })
      .then(() => setNewFaculty(''))
      .then(() =>
        fetch(`http://localhost:5000/faculties/${selectedInstitution}`)
          .then((res) => res.json())
          .then(setFaculties)
      )
      .catch((err) => console.error(err));
  };

  const handleAddCourse = () => {
    if (!newCourse.trim()) return;
    fetch('http://localhost:5000/addCourse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facultyId: selectedFaculty,
        courseName: newCourse,
      }),
    })
      .then(() => setNewCourse(''))
      .then(() =>
        fetch(`http://localhost:5000/courses/${selectedFaculty}`)
          .then((res) => res.json())
          .then(setCourses)
      )
      .catch((err) => console.error(err));
  };

  const handleDeleteFaculty = (facultyId) => {
    fetch(`http://localhost:5000/deleteFaculty/${facultyId}`, { method: 'DELETE' })
      .then(() => setFaculties((prev) => prev.filter((fac) => fac.id !== facultyId)))
      .catch((err) => console.error(err));
  };

  const handleDeleteCourse = (courseId) => {
    fetch(`http://localhost:5000/deleteCourse/${courseId}`, { method: 'DELETE' })
      .then(() => setCourses((prev) => prev.filter((course) => course.id !== courseId)))
      .catch((err) => console.error(err));
  };

  const handleUpdateStatus = (applicationId, status) => {
    fetch(`http://localhost:5000/updateApplicationStatus/${applicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
        );
      })
      .catch((err) => console.error(err));
  };

  const handlePublishAdmissions = async () => {
    if (!selectedInstitution) {
      alert('Please select an institution first.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/releaseAdmissions/${selectedInstitution}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text(); // Capture server-side error messages
        throw new Error(errorMessage || 'Failed to release admissions');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Admissions released successfully');
    } catch (err) {
      console.error('Error:', err.message);
      alert('An error occurred. Please check the server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  const getImageSrc = (fileData, fileType) => {
    // Assuming fileData contains the image file path or URL (e.g., '/uploads/filename.jpg')
    return fileData && fileType
      ? `http://localhost:5000${fileData}` // Build the full URL to access the image
      : null;
  };

  // Render dashboard
  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Institute Dashboard
      </h1>
      <button
        onClick={handleLogout}
        style={{
          display: 'block',
          margin: '10px auto',
          padding: '10px 20px',
          backgroundColor: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      {/* Dropdown for Institutions */}
      <select
        onChange={(e) => setSelectedInstitution(e.target.value)}
        value={selectedInstitution}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      >
        <option value="">Select Institution</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {/* Faculties */}
      <div
        style={{
          marginBottom: '20px',
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ marginBottom: '10px', color: '#333' }}>Manage Faculties</h2>
        <input
          type="text"
          placeholder="Add Faculty"
          value={newFaculty}
          onChange={(e) => setNewFaculty(e.target.value)}
          style={{
            padding: '10px',
            width: 'calc(100% - 100px)',
            marginRight: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleAddFaculty}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
        <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
          {faculties.map((faculty) => (
            <li
              key={faculty.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderBottom: '1px solid #ddd',
              }}
            >
              {faculty.name}
              <button
                onClick={() => handleDeleteFaculty(faculty.id)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Courses */}
      <div
        style={{
          marginBottom: '20px',
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ marginBottom: '10px', color: '#333' }}>Manage Courses</h2>
        <select
          onChange={(e) => setSelectedFaculty(e.target.value)}
          value={selectedFaculty}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        >
          <option value="">Select Faculty</option>
          {faculties.map((fac) => (
            <option key={fac.id} value={fac.id}>
              {fac.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add Course"
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
          style={{
            padding: '10px',
            width: 'calc(100% - 100px)',
            marginRight: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleAddCourse}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
        <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
          {courses.map((course) => (
            <li
              key={course.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderBottom: '1px solid #ddd',
              }}
            >
              {course.name}
              <button
                onClick={() => handleDeleteCourse(course.id)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
{/* Applications */}
<div>
  {/* Applications Section */}
  {selectedInstitution && (
    <div>
      <h3 style={{ color: 'darkblue', fontSize: '24px' }}>Applications</h3>
      <div>
        {loadingApplications ? (
          <p style={{ color: 'grey' }}>Loading applications...</p>
        ) : errorApplications ? (
          <p style={{ color: 'red' }}>{errorApplications}</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Faculty</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Result File</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{application.name}</td>
                    <td style={{ padding: '10px' }}>{application.email}</td>
                    <td style={{ padding: '10px' }}>{application.faculty_name}</td>
                    <td style={{ padding: '10px' }}>{application.course_name}</td>
                    <td style={{ padding: '10px' }}>
                      {application.pictureUrl && (
                        <a
                          href={application.pictureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          View Result
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>{application.status}</td>
                    <td style={{ padding: '10px' }}>
                      {application.status !== 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'Accepted')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            margin: '5px',
                          }}
                        >
                          Accept
                        </button>
                      )}
                      {application.status !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'Rejected')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            margin: '5px',
                          }}
                        >
                          Reject
                        </button>
                      )}
                      {application.status !== 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'Pending')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: 'orange',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            margin: '5px',
                          }}
                        >
                          Mark as Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      {/* Publish Admissions */}
      <button
        onClick={handlePublishAdmissions}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Publish Admissions
      </button>
      {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}

    </div>
  )}
</div>


    </div>
  );
};

export default InstituteDashboard;
