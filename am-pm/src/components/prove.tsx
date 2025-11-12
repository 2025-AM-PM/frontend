import "../styles/prove.css";
import { useState } from "react";
import { getReadMe } from "../api/getRepo";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const sanitizeSchema = {
  ...defaultSchema,
  // img/a 등 필요한 태그/속성 허용(필요에 맞게 확장 가능)
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img || []),
      // 일반적으로 쓰는 속성들 추가
      ["src"],
      ["alt"],
      ["title"],
      ["width"],
      ["height"],
      ["loading"],
      ["decoding"],
      ["style"],
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["href"],
      ["title"],
      ["target"],
      ["rel"],
    ],
  },
};

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

  // 선택: img 렌더링 커스텀 (lazy 등)
  const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      loading="lazy"
      decoding="async"
      style={{ maxWidth: "100%" }}
      alt="post-image"
    />
  );

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            urlTransform={defaultUrlTransform}
            components={{
              img: Img,
              // a: (p) => <a {...p} />,
            }}
          >
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
