import React, { useEffect, useState } from "react";
import ReactMarkdown, { Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "../styles/post-detail.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Header from "./header";
import { PostDetail as Post } from "../types";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";

function formatDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

type CodeRenderer = NonNullable<Components["code"]>;
type ImgRenderer = NonNullable<Components["img"]>;

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);

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

  useEffect(() => {
    if (!id) return;
    apiFetch<Post>(`/posts/${id}`).then((res) => {
      if (res.data) {
        setPost(res.data);
      }
    });
  }, [id]);

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

  // react-markdown용 매핑: 링크 target, 이미지 제거, 코드 기본 처리
  const mdComponents: Components = {
    code: CodeBlock,
    img: MdImage,
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer" aria-label="상세보기" />
    ),
  };

  if (!post) {
    return (
      <section className="post-detail">
        <Header />
        <div className="pd-container">
          <div className="pd-skeleton" />
          <div className="pd-skeleton pd-skeleton--wide" />
          <div className="pd-skeleton pd-skeleton--md" />
        </div>
      </section>
    );
  }

  return (
    <section className="post-detail">
      <Header />
      <div className="pd-container">
        {/* 타이틀 블록 */}
        <header className="pd-head">
          <div className="pd-title-row">
            <h1 className="pd-title">{post.title}</h1>
          </div>

          <div className="pd-meta">
            <span className="pd-meta__item">
              작성자: {post.createBy.studentName}{" "}
            </span>
            <span className="pd-meta__item">
              작성날짜: {formatDate(post.createdAt ? post.createdAt : "")}
            </span>
            <span className="pd-meta__item">조회수: {post.views}</span>
          </div>

          <hr className="pd-divider" />
        </header>

        {/* 본문 */}
        <article className="pd-body markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={mdComponents}
            urlTransform={defaultUrlTransform}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* 하단 좋아요/싫어요 */}
        <footer className="pd-vote">
          <button
            className="pd-vote__btn"
            type="button"
            aria-label="좋아요"
            title="좋아요"
          >
            {/* 하트 아이콘 */}
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 21s-6.716-4.373-9.192-7.03C1.115 12.167 1 9.89 2.343 8.343A4.5 4.5 0 0 1 8 8c.9.54 1.7 1.4 2 2 .3-.6 1.1-1.46 2-2a4.5 4.5 0 0 1 5.657.343c1.343 1.546 1.228 3.824-.465 5.627C18.716 16.627 12 21 12 21z"
              />
            </svg>
            <span>좋아요 {post.likes}</span>
          </button>
        </footer>
      </div>
    </section>
  );
}
