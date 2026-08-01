import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage     from "./components/LandingPage";
import Contact         from "./components/Contact";
import About           from "./components/About";
import ChangePassword  from "./components/ChangePassword";
import StudentProfile  from "./components/StudentProfile";
import Notes           from "./components/Notes";
import Doubt           from "./components/Doubt";
import FacultyProfile  from "./components/FacultyProfile";
import UploadNotes     from "./components/UploadNotes";
import SolveDoubt      from "./components/SolveDoubt";
import AdminProfile    from "./components/AdminProfile";
import AddStudent      from "./components/AddStudent";
import AddStudentCsv   from "./components/AddStudentCsv";
import AddFaculty      from "./components/AddFaculty";
import AddFacultyCsv   from "./components/AddFacultyCsv";
import DeleteStudent   from "./components/DeleteStudent";
import DeleteFaculty   from "./components/DeleteFaculty";
import ProtectedRoute  from "./components/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<LandingPage />} />
        <Route path="/contact"         element={<Contact />} />
        <Route path="/about"           element={<About />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Student-only */}
        <Route path="/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
        <Route path="/notes"   element={<ProtectedRoute role="student"><Notes /></ProtectedRoute>} />
        <Route path="/doubt"   element={<ProtectedRoute role="student"><Doubt /></ProtectedRoute>} />

        {/* Faculty-only */}
        <Route path="/faculty"      element={<ProtectedRoute role="faculty"><FacultyProfile /></ProtectedRoute>} />
        <Route path="/upload-notes" element={<ProtectedRoute role="faculty"><UploadNotes /></ProtectedRoute>} />
        <Route path="/solve-doubt"  element={<ProtectedRoute role="faculty"><SolveDoubt /></ProtectedRoute>} />

        {/* Admin-only */}
        <Route path="/admin-profile"                 element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin-profile/add-student"     element={<ProtectedRoute role="admin"><AddStudent /></ProtectedRoute>} />
        <Route path="/admin-profile/add-student-csv" element={<ProtectedRoute role="admin"><AddStudentCsv /></ProtectedRoute>} />
        <Route path="/admin-profile/delete-student" element={<ProtectedRoute role="admin"><DeleteStudent /></ProtectedRoute>} />
        <Route path="/admin-profile/add-faculty"     element={<ProtectedRoute role="admin"><AddFaculty /></ProtectedRoute>} />
        <Route path="/admin-profile/add-faculty-csv" element={<ProtectedRoute role="admin"><AddFacultyCsv /></ProtectedRoute>} />
        <Route path="/admin-profile/delete-faculty" element={<ProtectedRoute role="admin"><DeleteFaculty /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
