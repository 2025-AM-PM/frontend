// App.tsx
import React, { useEffect } from "react";
import { Routes, Route, useNavigate, RouterProvider } from "react-router-dom";
import HomePage from "./pages/Home";
import Project from "./components/project";
import "./App.css";
import Rank from "./components/rank";
import BoardWrite from "./components/boardWrite";
import LoginPage from "./components/login";
import { AuthProvider, useAuth } from "./contexts/userContext";
import RegisterPage from "./components/register";
import PollList from "./components/pollList";
import PollCreate from "./components/pollCreate";
import Mypage from "./pages/mypage";
import PostDetail from "./components/postDetail";
import AdminPage from "./pages/AdminPage";
import Prove from "./components/prove";
import BoardList from "./components/boardList";
import ErrorPage from "./components/error";
import { router } from "./api/router";

// function AppInner() {
//   const { setUser } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <Routes>
//       <Route path="/" element={<HomePage />} />
//       <Route path="/projects" element={<Project />} />
//       <Route path="/rank" element={<Rank />} />
//       <Route path="/polls" element={<PollList />} />
//       <Route path="/polls/create" element={<PollCreate />} />
//       <Route path="/board/:category/write" element={<BoardWrite />} />
//       <Route path="/detail" element={<PostDetail />} />
//       <Route
//         path="/login"
//         element={
//           <LoginPage
//             onSuccess={(u) => {
//               setUser(u);
//               navigate("/");
//             }}
//           />
//         }
//       />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/mypage" element={<Mypage />} />
//       <Route path="/admin" element={<AdminPage />} />
//       <Route path="/prove" element={<Prove />} />
//       <Route path="/board/all" element={<BoardList />} />
//       <Route path="/error" element={<ErrorPage />} />
//     </Routes>
//   );
// }

export default function App() {
  useEffect(() => {
    if (!localStorage.getItem("clock_target_iso")) {
      localStorage.setItem("clock_target_iso", "2025-12-25T09:00:00+09:00");
    }
  }, []);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
