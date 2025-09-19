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

function AppInner() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("clock_target_iso")) {
      localStorage.setItem("clock_target_iso", "2025-09-01T09:00:00+09:00");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<Project />} />
      <Route path="/rank" element={<Rank />} />
      <Route path="/board/:category/write" element={<BoardWrite />} />
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
