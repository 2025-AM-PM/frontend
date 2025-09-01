import React, { useEffect, useMemo, useState } from "react";
import MarkdownIt from "markdown-it";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textArea"; // ← 파일명/경로 대소문자 정확히!
import { Label } from "../components/label";

import "../styles/post-editor.css"; // 기존 스타일 + 아래 추가 CSS가 이 파일에 들어가야 함

export default function BoardWrite() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const onSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    console.log("[SUBMIT]", { title, content });
    alert("Draft submitted to console (demo).");
  };

  // ⌘/Ctrl + Enter
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [title, content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Markdown 렌더러 & 프리뷰
  const md = useMemo(
    () =>
      new MarkdownIt({
        html: false,
        linkify: true,
        breaks: true,
      }),
    []
  );
  const [previewHtml, setPreviewHtml] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setPreviewHtml(md.render(content || "")), 150);
    return () => clearTimeout(t);
  }, [content, md]);

  return (
    <section className="pe-wrap">
      <div className="pe-grid">
        {/* Left: Editor */}
        <form onSubmit={handleSubmit} className="pe-form">
          {/* Title */}
          <div className="pe-field">
            <Label htmlFor="post-title" className="pe-label">
              Title
            </Label>
            <Input
              id="post-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="Enter your post title..."
              className="pe-input"
            />
          </div>

          {/* Content */}
          <div className="pe-field">
            <Label htmlFor="post-body" className="pe-label pe-label--secondary">
              Content (Markdown)
            </Label>
            <div className="pe-textarea-wrap">
              <Textarea
                id="post-body"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent(e.target.value)
                }
                placeholder={`# Start writing your post here...

Write your content in Markdown. You can use:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- \`inline code\`

\`\`\`javascript
// Code blocks
console.log('Hello, world!');
\`\`\`

> Blockquotes for emphasis

- List items
- More items`}
                className="pe-textarea"
              />
              <p className="pe-hint">Supports Markdown</p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="pe-button"
            disabled={!title.trim() || !content.trim()}
          >
            포스트 작성
          </Button>
        </form>

        {/* Right: Preview */}
        <aside className="pe-preview" aria-label="Preview">
          <div className="pe-preview-card">
            <div className="pe-preview-head">Preview</div>
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
