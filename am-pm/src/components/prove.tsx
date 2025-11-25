import "../styles/prove.css";
import { useState } from "react";
import { get } from "react-readit";
import ReactMarkdown, { Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { apiFetch } from "../api/client";
// import { useNavigate } from "react-router-dom";

type CodeRenderer = NonNullable<Components["code"]>;
type ImgRenderer = NonNullable<Components["img"]>;

export default function Prove() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // const navigate = useNavigate();

  const onPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!url.trim()) {
      setErr("깃 주소를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const md = await get({ input: url.trim() });
      setContent(md);
    } catch (e: any) {
      setErr(e?.message ?? "가져오기에 실패했습니다.");
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    // if (!title.trim()) {
    //   alert("제목을 입력해주세요.");
    //   return;
    // }
    // if (!content) {
    //   alert("먼저 미리보기를 통해 내용을 확인해주세요.");
    //   return;
    // }

    // try {
    //   const postData = {
    //     title: title,
    //     description: content,
    //     exhibitUrl: url,
    //   };

    //   const res = await apiFetch("/exhibits", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(postData),
    //     auth: true,
    //   });

    //   if (res.status === 200 || res.status === 201) {
    //     alert("작성되었습니다.");
    //     navigate("/board/all");
    //   } else {
    //     alert("작성에 실패했습니다.");
    //   }
    // } catch (e) {
    //   console.error(e);
    //   alert("오류가 발생했습니다.");
    // }
    alert("제출 기능은 준비중입니다.");
  };

  const CodeBlock: CodeRenderer = ({ children, className }) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        PreTag="div"
        language={match[1]}
        style={dark}
        wrapLongLines
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={`md-inline-code ${className ?? ""}`}>{children}</code>
    );
  };

  const MdImage: ImgRenderer = ({ node, alt, ...props }) => {
    return (
      <img
        {...props}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="md-img"
      />
    );
  };

  const mdComponents: Components = {
    code: CodeBlock,
    img: MdImage,
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer" aria-label="상세보기" />
    ),
  };

  return (
    <div className="prove-container">
      <div className="prove-header">
        <h1 className="prove-title">프로젝트 등록</h1>
        <p className="prove-subtitle">GitHub README를 불러와 프로젝트를 등록하세요.</p>
      </div>

      <div className="prove-input-section">
        <div className="input-group">
          <label>제목</label>
          <input
            type="text"
            placeholder="프로젝트 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="prove-input"
          />
        </div>
        <div className="input-group">
          <label>GitHub URL</label>
          <div className="url-input-wrapper">
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="prove-input"
            />
            <button 
              onClick={onPreview} 
              className="preview-btn"
              disabled={loading}
            >
              {loading ? "로딩중..." : "미리보기"}
            </button>
          </div>
        </div>
        {err && <div className="prove-error">{err}</div>}
      </div>

      <div className="prove-preview-section">
        {content ? (
          <>
            <div className="preview-header">
              <h2>미리보기</h2>
              <button onClick={onSubmit} className="submit-btn">작성하기</button>
            </div>
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={mdComponents}
                urlTransform={defaultUrlTransform}
              >
                {content}
              </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="prove-empty-state">
            <p>GitHub URL을 입력하고 미리보기 버튼을 눌러주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
