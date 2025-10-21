// router.tsx
import { createBrowserRouter, redirect } from "react-router-dom";
import BoardWrite from "../components/boardWrite";

export const router = createBrowserRouter([
  {
    path: "/board/:category/write",
    element: <BoardWrite />,
    action: async ({ request }) => {
      const form = await request.formData();
      await createPost({
        title: form.get("title"),
        body: form.get("body"),
      });
      return redirect("/posts"); // ✅ 생성 후 리스트로 이동
    },
  },
]);
