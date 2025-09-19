import React, { useEffect, useRef, useState, useDeferredValue } from "react";
import ReactMarkdown, { Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textArea";
import { Label } from "../components/label";
import { uploadImageRemote } from "../lib/uploadRemote";
import { apiFetch } from "../api/client";
import "../styles/post-editor.css";

export default function BoardWrite() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const deferredContent = useDeferredValue(content);
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

  // 파일 업로드 → URL → 마크다운 삽입
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

  const onSubmit = async () => { // 비동기 처리를 위해 async 사용
  if (!title.trim() || !content.trim()) return;

  const postData = {
    title: title,
    description: content,
    exhibitUrl: "" // todo: 어떻게 추가할것인지
  };

  // const API_ENDPOINT =  process.env.REACT_APP_API_BASE+'/exhibits'; // 실제 백엔드 API 주소

  try {
    const { data } = await apiFetch('/exhibits', {
      // 1. HTTP 메서드 지정
      method: 'POST',
      // 2. 헤더에 콘텐츠 타입 명시
      headers: {
        'Content-Type': 'application/json',
      },
      // 3. 데이터를 JSON 문자열로 변환하여 body에 담아 전송
      body: JSON.stringify(postData),
    }); 

    console.log('게시글 등록 성공:', data);
    alert('게시글이 성공적으로 등록되었습니다.');

  } catch (error) {
    console.error('게시글 등록 실패:', error);
    alert('게시글 등록 중 오류가 발생했습니다.');
  }
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

  // react-markdown용 컴포넌트 매핑(필요 시 커스터마이징)
  const mdComponents: Components = {
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer" />
    ),
    img: ({ node, ...props }) => (
      <img {...props} loading="lazy" decoding="async" />
    ),
    // 코드 블록 커스터마이징이 필요하면 아래를 확장하면 됨
    // code: ({inline, className, children, ...props}) => {
    //   return inline
    //     ? <code className={className} {...props}>{children}</code>
    //     : <pre className={className}><code {...props}>{children}</code></pre>;
    // },
  };

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
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={mdComponents}
                urlTransform={defaultUrlTransform}
              >
                {deferredContent || ""}
              </ReactMarkdown>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
