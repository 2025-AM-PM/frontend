import React, {
  useEffect,
  useRef,
  useState,
  useDeferredValue,
  FC,
  ComponentProps,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textArea";
import { Label } from "../components/label";
import { uploadImageRemote } from "../lib/uploadRemote";
import { apiFetch } from "../api/client";
import "../styles/post-editor.css";

// 이미지 url 만료시 재요청 받는 기능 추가해야 함.
const urlCache = new Map<string, string>();

// [수정] ImgProps 대신 React의 내장 타입인 ComponentProps<'img'>를 사용합니다.
// 이렇게 하면 react-markdown 버전이 바뀌어도 코드가 깨지지 않습니다
const CustomImageRenderer: FC<ComponentProps<"img">> = ({
  src,
  alt,
  ...props
}) => {
  const [actualSrc, setActualSrc] = useState<string | undefined>(src);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (src && src.startsWith("exhibits/images/")) {
      if (urlCache.has(src)) {
        setActualSrc(urlCache.get(src));
        return;
      }

      const fetchPresignedUrl = async () => {
        setIsLoading(true);
        try {
          const { data: presignedInfo } = await apiFetch<{
            presignedUrl: string;
          }>(`/files/download?fileId=${encodeURIComponent(src)}`, {
            method: "GET",
            auth: true,
          });
          if (presignedInfo) {
            console.log(
              "useEffect 실행됨. preSinged :",
              presignedInfo.presignedUrl
            );
            urlCache.set(src, presignedInfo.presignedUrl);
            setActualSrc(presignedInfo.presignedUrl);
          }
        } catch (error) {
          console.error(
            `'${src}'의 Presigned URL을 가져오지 못했습니다.`,
            error
          );
          setActualSrc(src);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPresignedUrl();
    } else {
      setActualSrc(src);
    }
  }, [src]);

  if (isLoading) {
    return <span>이미지 로딩 중...</span>;
  }

  return (
    <img
      {...props}
      src={actualSrc}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="md-img"
    />
  );
};

export default function BoardWrite() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const deferredContent = useDeferredValue(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  interface UploadUrlResponse {
    fileId: string;
    presignedUrl: string;
  }

  const handleFiles = async (files: FileList | File[]) => {
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const { data: uploadInfo } = await apiFetch<UploadUrlResponse>(
          "/files/upload",
          {
            method: "GET",
            auth: true,
          }
        );

        if (!uploadInfo) {
          throw new Error("서버로부터 업로드 정보를 받지 못했습니다.");
        }

        const { fileId, presignedUrl } = uploadInfo;
        console.log("Presigned URL: ", presignedUrl);
        insertAtCursor(`
![image](${fileId})
`);
        await uploadImageRemote(presignedUrl, f);
        console.log("성공적으로 파일을 업로드 했습니다.");
      } catch (error) {
        console.error("파일 업로드 실패:", error);
        alert("파일 업로드 중 문제가 생겼습니다.");
      }
    }
  };

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

  const onDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) await handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLTextAreaElement>) =>
    e.preventDefault();

  const onSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    const postData = {
      title: title,
      description: content,
      exhibitUrl: "",
    };

    try {
      const { data } = await apiFetch("/exhibits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        auth: true,
      });
      console.log("게시글 등록 성공:", data);
      alert("게시글이 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };

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

  const mdComponents: Components = {
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer" />
    ),
    img: CustomImageRenderer,
  };

  return (
    <section className="pe-wrap">
      <div className="pe-grid">
        <form onSubmit={handleSubmit} className="pe-form">
          <div className="pe-field">
            <Label htmlFor="post-title" className="pe-label">
              Title
            </Label>
            <Input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="pe-input"
            />
          </div>
          <div className="pe-field">
            <Label htmlFor="post-body" className="pe-label pe-label--secondary">
              Content (Markdown)
            </Label>
            <div className="pe-textarea-wrap">
              <Textarea
                id="post-body"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={onPaste}
                onDrop={onDrop}
                onDragOver={onDragOver}
                placeholder={`# Start writing your post here...`}
                className="pe-textarea"
              />
              <p className="pe-hint">
                Supports Markdown. Paste or drag images to upload.
              </p>
            </div>
          </div>
          <Button
            type="submit"
            className="pe-button"
            disabled={!title.trim() || !content.trim()}
          >
            포스트 작성
          </Button>
        </form>
        <aside className="pe-preview" aria-label="Preview">
          <div className="pe-preview-card">
            <div className="pe-preview-head">Preview</div>
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={mdComponents}
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
