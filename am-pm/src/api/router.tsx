// router.tsx
import { createBrowserRouter, redirect, useNavigate } from "react-router-dom";
import BoardWrite from "../components/boardWrite";
import { apiFetch } from "./client";
import HomePage from "../pages/Home";
import Project from "../components/project";
import Rank from "../components/rank";
import PollList from "../components/pollList";
import PollCreate from "../components/pollCreate";
import PostDetail from "../components/postDetail";
import LoginPage from "../components/login";
import { useAuth } from "../contexts/userContext";
import RegisterPage from "../components/register";
import Mypage from "../pages/mypage";
import AdminPage from "../pages/AdminPage";
import BoardList from "../components/boardList";
import ErrorPage from "../components/error";
import Prove from "../components/prove";

function LoginRoute() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return (
    <LoginPage
      onSuccess={(u) => {
        setUser(u);
        navigate("/");
      }}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/board/:category/write",
    element: <BoardWrite />,
    errorElement: <ErrorPage />,
    action: async ({ request }) => {
      const form = await request.formData();

      const title = String(form.get("title") || "").trim();
      const content = String(form.get("description") || "").trim();
      const exhibitUrl = String(form.get("exhibitUrl") || "");

      if (!title || !content) {
        return JSON.stringify({
          fieldError: "Title and description are required.",
          status: 400,
        });
      }

      const postData = {
        title: title,
        description: content,
        exhibitUrl: exhibitUrl,
      };

      try {
        const res = await apiFetch("/exhibits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
          auth: true,
        });

        if (!res.status) {
          throw new Response("Create failed", { status: res.status });
        }

        return redirect("/board/all");
      } catch (e) {
        throw e instanceof Response
          ? e
          : new Response("Unexpected error", { status: 500 });
      }
    },
  },
  {
    path: "/",
    Component: HomePage,
  },
  { path: "/projects", Component: Project },
  { path: "/rank", Component: Rank },
  { path: "/polls", Component: PollList },
  { path: "/polls/create", Component: PollCreate },
  { path: "/detail", Component: PostDetail },
  { path: "/login", element: <LoginRoute /> },
  { path: "/register", Component: RegisterPage },
  { path: "/mypage", Component: Mypage },
  { path: "/admin", Component: AdminPage },
  { path: "/prove", Component: Prove },
  { path: "/board/all", Component: BoardList },
  { path: "*", Component: ErrorPage },
]);
