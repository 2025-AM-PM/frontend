// router.tsx
import {
  createBrowserRouter,
  redirect,
  useNavigate,
  Navigate,
} from "react-router-dom";
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
import { register as registerApi } from "./auth";

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

function AdminRoute() {
  const { user } = useAuth();

  // 로그인 안 되어 있으면 로그인 페이지로
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 로그인은 됐지만 권한이 없으면 홈으로 (또는 에러 페이지로 변경 가능)
  if (user.role !== "SYSTEM_ADMIN") {
    return <ErrorPage />;
    // 혹은: return <ErrorPage />;
  }

  // 권한이 맞을 때만 실제 AdminPage 렌더링
  return <AdminPage />;
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
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <ErrorPage />,
    action: async ({ request }) => {
      const form = await request.formData();

      const studentNumber = String(form.get("studentNumber") || "").trim();
      const studentName = String(form.get("studentName") || "").trim();
      const studentPassword = String(form.get("studentPassword") || "");

      try {
        const status = await registerApi({
          studentName,
          studentNumber,
          studentPassword,
        });

        if (status === 200 || status === 201) {
          alert(
            "회원가입이 완료되었습니다. 관리자 승인 이후 로그인 할 수 있습니다."
          );
          return redirect("/login");
        }

        // API에서 비정상 status를 돌려준 경우 → 에러 페이지
        throw new Response("회원가입 실패", {
          status: status || 500,
          statusText: `회원가입 실패 (status: ${status})`,
        });
      } catch (e: any) {
        if (e instanceof Response) {
          throw e;
        }

        const status = e?.status || 500;

        if (status === 500) {
          throw new Response(
            "이미 가입된 사용자입니다. 관리자에게 문의하세요.",
            { status: 500 }
          );
        }

        if (status === 400) {
          throw new Response("입력 정보를 다시 확인해주세요.", {
            status: 400,
          });
        }

        throw new Response("Unexpected error", { status });
      }
    },
  },
  { path: "/projects", Component: Project },
  { path: "/rank", Component: Rank },
  { path: "/polls", Component: PollList },
  { path: "/polls/create", Component: PollCreate },
  { path: "/detail", Component: PostDetail },
  { path: "/login", element: <LoginRoute /> },
  { path: "/register", Component: RegisterPage },
  { path: "/mypage", Component: Mypage },
  { path: "/admin", element: <AdminRoute /> },
  { path: "/prove", Component: Prove },
  { path: "/board/all", Component: BoardList },
  { path: "*", Component: ErrorPage },
]);
