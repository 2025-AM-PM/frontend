// App.tsx
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/Home";
import Project from "./components/project";
import "./App.css";
import Rank from "./components/rank";
import BoardWrite from "./components/boardWrite";
import LoginPage from "./components/login";
import { AuthProvider, useAuth } from "./contexts/userContext";
import RegisterPage from "./components/register";
import Poll from "./components/poll";
import PollCreate from "./components/pollCreate";
import PostDetail from "./components/postDetail";

function AppInner() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("clock_target_iso")) {
      localStorage.setItem("clock_target_iso", "2025-12-25T09:00:00+09:00");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<Project />} />
      <Route path="/rank" element={<Rank />} />
      <Route path="/polls" element={<Poll />} />
      <Route path="/polls/create" element={<PollCreate />} />
      <Route path="/board/:category/write" element={<BoardWrite />} />
      <Route path="/detail" element={<PostDetail />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onSuccess={(u) => {
              setUser(u);
              navigate("/");
            }}
          />
        }
      />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
