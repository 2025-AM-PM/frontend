// App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/userContext";
import { router } from "./api/router";

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
