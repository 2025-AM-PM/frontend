import React, { useEffect, useMemo, useRef, useState } from "react";
import MarkdownIt from "markdown-it";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textArea";
import { Label } from "../components/label";
import { uploadImageRemote } from "../lib/uploadRemote";
import "../styles/post-editor.css";

export default function BoardWrite() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 커서 위치에 문자열 삽입
  const insertAtCursor = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((v) => `${v}\n${snippet}`);
      return;
    }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const next = `${before}${snippet}${after}`;

    setContent(next);

    const caretPos = start + snippet.length;
    const prevScroll = ta.scrollTop;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caretPos, caretPos);
      ta.scrollTop = prevScroll;
    });
  };

  // 파일들 업로드 → URL → 마크다운 삽입
  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const f of list) {
      if (!f.type.startsWith("image/")) continue;
      const url = await uploadImageRemote(f);
      insertAtCursor(`\n![image](${url})\n`);
    }
  };

  // 붙여넣기 이미지 처리
  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imgs: File[] = [];
    for (const it of items as any) {
      const file = it.getAsFile?.();
      if (file && file.type?.startsWith("image/")) imgs.push(file);
    }
    if (imgs.length) {
      e.preventDefault();
      await handleFiles(imgs);
    }
  };

  // 드래그&드롭 이미지 처리
  const onDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) await handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLTextAreaElement>) =>
    e.preventDefault();

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

  // Markdown 렌더러 & 프리뷰(150ms 디바운스)
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
                ref={textareaRef}
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent(e.target.value)
                }
                onPaste={onPaste}
                onDrop={onDrop}
                onDragOver={onDragOver}
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
              <p className="pe-hint">
                Supports Markdown. Paste or drag images to upload.
              </p>
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
