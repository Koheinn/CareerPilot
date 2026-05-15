import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import MockInterview from "./pages/MockInterview";
import Profile from "./pages/Profile";
import CareerConsult from "./pages/CareerConsult";

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} setUser={setUser} />}>
          <Route index element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="auth" element={user ? <Navigate to="/dashboard" /> : <Auth setUser={setUser} />} />
          <Route path="dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
          <Route path="analyzer" element={user ? <ResumeAnalyzer /> : <Navigate to="/auth" />} />
          <Route path="matcher" element={user ? <JobMatcher /> : <Navigate to="/auth" />} />
          <Route path="interview" element={user ? <MockInterview user={user} /> : <Navigate to="/auth" />} />
          <Route path="consult" element={user ? <CareerConsult /> : <Navigate to="/auth" />} />
          <Route path="profile" element={user ? <Profile user={user} /> : <Navigate to="/auth" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
