import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  if (user) {
    return user.role === "faculty" ? (
      <FacultyDashboard user={user} logout={logout} />
    ) : (
      <StudentDashboard user={user} logout={logout} />
    );
  }

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(`${API}/auth/login`, loginData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/auth/register`, registerData);

      setMessage("Registration successful. Please login.");

      setLoginData({
        email: registerData.email,
        password: ""
      });

      setPage("login");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>College Assignment Portal</h1>

        <div className="tabs">
          <button
            className={page === "login" ? "active" : ""}
            onClick={() => {
              setPage("login");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={page === "register" ? "active" : ""}
            onClick={() => {
              setPage("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {page === "login" ? (
          <form onSubmit={login}>
            <label>Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value
                })
              }
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value
                })
              }
              required
            />

            <button className="primary-btn" type="submit">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={register}>
            <label>Full Name</label>
            <input
              type="text"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  name: e.target.value
                })
              }
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  email: e.target.value
                })
              }
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value
                })
              }
              minLength="6"
              required
            />

            <label>Role</label>
            <select
              value={registerData.role}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  role: e.target.value
                })
              }
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>

            <button className="primary-btn" type="submit">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================= FACULTY DASHBOARD ================= */

function FacultyDashboard({ user, logout }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");

  const [assignment, setAssignment] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    maxMarks: 100
  });

  const [grades, setGrades] = useState({});

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const loadData = async () => {
    try {
      const [assignmentResponse, submissionResponse] =
        await Promise.all([
          axios.get(`${API}/assignments/faculty`, config),
          axios.get(`${API}/submissions/faculty`, config)
        ]);

      setAssignments(assignmentResponse.data);
      setSubmissions(submissionResponse.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load data"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createAssignment = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API}/assignments`,
        assignment,
        config
      );

      setMessage("Assignment created successfully.");

      setAssignment({
        title: "",
        subject: "",
        description: "",
        dueDate: "",
        maxMarks: 100
      });

      loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create assignment"
      );
    }
  };

  const gradeSubmission = async (submissionId) => {
    const grade = grades[submissionId];

    if (!grade || grade.marks === "") {
      setMessage("Enter marks first.");
      return;
    }

    try {
      await axios.put(
        `${API}/submissions/${submissionId}/grade`,
        {
          marks: Number(grade.marks),
          feedback: grade.feedback || ""
        },
        config
      );

      setMessage("Submission graded successfully.");
      loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to grade submission"
      );
    }
  };

  return (
    <div className="dashboard">
      <header>
        <div>
          <h1>Faculty Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>Create Assignment</h2>

        <form onSubmit={createAssignment}>
          <div className="grid">
            <div>
              <label>Title</label>
              <input
                type="text"
                value={assignment.title}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    title: e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label>Subject</label>
              <input
                type="text"
                value={assignment.subject}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    subject: e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label>Due Date</label>
              <input
                type="datetime-local"
                value={assignment.dueDate}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    dueDate: e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label>Maximum Marks</label>
              <input
                type="number"
                min="1"
                value={assignment.maxMarks}
                onChange={(e) =>
                  setAssignment({
                    ...assignment,
                    maxMarks: e.target.value
                  })
                }
                required
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            value={assignment.description}
            onChange={(e) =>
              setAssignment({
                ...assignment,
                description: e.target.value
              })
            }
            required
          />

          <button className="primary-btn" type="submit">
            Create Assignment
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Your Assignments</h2>

        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          <div className="assignment-list">
            {assignments.map((item) => (
              <div className="assignment-item" key={item._id}>
                <h3>{item.title}</h3>
                <p>
                  <strong>Subject:</strong> {item.subject}
                </p>
                <p>{item.description}</p>
                <p>
                  <strong>Due:</strong>{" "}
                  {new Date(item.dueDate).toLocaleString()}
                </p>
                <p>
                  <strong>Max Marks:</strong> {item.maxMarks}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Student Submissions</h2>

        {submissions.length === 0 ? (
          <p>No student submissions yet.</p>
        ) : (
          <div className="submission-list">
            {submissions.map((submission) => {
              const currentGrade =
                grades[submission._id] || {
                  marks:
                    submission.marks !== null
                      ? submission.marks
                      : "",
                  feedback: submission.feedback || ""
                };

              return (
                <div
                  className="submission-item"
                  key={submission._id}
                >
                  <h3>
                    {submission.assignment?.title}
                  </h3>

                  <p>
                    <strong>Student:</strong>{" "}
                    {submission.student?.name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {submission.student?.email}
                  </p>

                  <p>
                    <strong>Project:</strong>{" "}
                    <a
                      href={submission.projectLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Project
                    </a>
                  </p>

                  <p>
                    <strong>Work Notes:</strong>{" "}
                    {submission.workNotes}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {submission.status}
                  </p>

                  <div className="grade-box">
                    <label>
                      Marks / {submission.assignment?.maxMarks}
                    </label>

                    <input
                      type="number"
                      min="0"
                      max={submission.assignment?.maxMarks}
                      value={currentGrade.marks}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [submission._id]: {
                            ...currentGrade,
                            marks: e.target.value
                          }
                        })
                      }
                    />

                    <label>Feedback</label>

                    <textarea
                      value={currentGrade.feedback}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [submission._id]: {
                            ...currentGrade,
                            feedback: e.target.value
                          }
                        })
                      }
                      placeholder="Enter feedback"
                    />

                    <button
                      className="primary-btn"
                      onClick={() =>
                        gradeSubmission(submission._id)
                      }
                    >
                      {submission.status === "Graded"
                        ? "Update Grade"
                        : "Grade Submission"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= STUDENT DASHBOARD ================= */

function StudentDashboard({ user, logout }) {
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState("");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [submission, setSubmission] = useState({
    projectLink: "",
    workNotes: ""
  });

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await axios.get(
        `${API}/assignments/student`,
        config
      );

      setAssignments(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load assignments"
      );
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const submitAssignment = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API}/submissions`,
        {
          assignmentId: selectedAssignment._id,
          projectLink: submission.projectLink,
          workNotes: submission.workNotes
        },
        config
      );

      setMessage("Assignment submitted successfully.");

      setSelectedAssignment(null);

      setSubmission({
        projectLink: "",
        workNotes: ""
      });

      loadAssignments();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to submit assignment"
      );
    }
  };

  return (
    <div className="dashboard">
      <header>
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="card">
        <h2>Assignments</h2>

        {assignments.length === 0 ? (
          <p>No assignments available.</p>
        ) : (
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <div
                className="assignment-item"
                key={assignment._id}
              >
                <div className="assignment-header">
                  <div>
                    <h3>{assignment.title}</h3>

                    <p>
                      <strong>Subject:</strong>{" "}
                      {assignment.subject}
                    </p>
                  </div>

                  <span
                    className={`status ${assignment.status.toLowerCase()}`}
                  >
                    {assignment.status}
                  </span>
                </div>

                <p>{assignment.description}</p>

                <p>
                  <strong>Due:</strong>{" "}
                  {new Date(
                    assignment.dueDate
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>Maximum Marks:</strong>{" "}
                  {assignment.maxMarks}
                </p>

                {assignment.submission && (
                  <div className="result-box">
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(
                        assignment.submission.submittedAt
                      ).toLocaleString()}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {assignment.submission.status}
                    </p>

                    {assignment.submission.marks !== null && (
                      <>
                        <p>
                          <strong>Marks:</strong>{" "}
                          {assignment.submission.marks} /{" "}
                          {assignment.maxMarks}
                        </p>

                        <p>
                          <strong>Feedback:</strong>{" "}
                          {assignment.submission.feedback ||
                            "No feedback provided"}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {assignment.status === "Pending" && (
                  <button
                    className="primary-btn"
                    onClick={() =>
                      setSelectedAssignment(assignment)
                    }
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Submit Assignment</h2>

            <h3>{selectedAssignment.title}</h3>

            <form onSubmit={submitAssignment}>
              <label>Project Link</label>

              <input
                type="url"
                placeholder="https://github.com/your-project"
                value={submission.projectLink}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    projectLink: e.target.value
                  })
                }
                required
              />

              <label>Work Notes</label>

              <textarea
                placeholder="Describe your work..."
                value={submission.workNotes}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    workNotes: e.target.value
                  })
                }
                required
              />

              <div className="modal-buttons">
                <button
                  className="primary-btn"
                  type="submit"
                >
                  Submit
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() =>
                    setSelectedAssignment(null)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
