import "../styles/prove.css";
import { useState } from "react";
import { getReadMe } from "../api/getRepo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function Prove() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!url.trim()) {
      setErr("깃 주소를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const md = await getReadMe(url.trim());
      setContent(md);
    } catch (e: any) {
      setErr(e?.message ?? "가져오기에 실패했습니다.");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prove-main">
      <form className="prove-form" onSubmit={onSubmit}>
        <input
          type="url"
          placeholder="깃 주소를 입력하세요 (예: https://github.com/owner/repo)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "가져오는 중..." : "제출하기"}
        </button>
      </form>

      {err && <div className="prove-error">{err}</div>}

      <div className="prove-preview">
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {content}
          </ReactMarkdown>
        ) : (
          <div className="prove-empty">
            여기에 README 미리보기가 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
