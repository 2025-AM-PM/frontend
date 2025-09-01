import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/Home";
import Project from "./components/project";
import "./App.css";
import Rank from "./components/rank";
import BoardWrite from "./components/boardWrite";

function App() {
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
    </Routes>
  );
}

export default App;
