import React, { useEffect, useState } from "react";
import "../styles/history-section.css";

type HistoryProps = {
  /** 외부에서 배경 이미지를 주입하고 싶을 때(선택) */
  backgroundUrl?: string;
  /** 컴포넌트 내에서 파일 업로드 UI 노출 여부 */
  allowUpload?: boolean;
};

const History: React.FC<HistoryProps> = ({
  backgroundUrl,
  allowUpload = true,
}) => {
  const [bg, setBg] = useState<string | null>(backgroundUrl ?? null);

  useEffect(() => {
    setBg(backgroundUrl ?? null);
  }, [backgroundUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBg(url);
  };

  return (
    <section className="history-section" aria-label="Our History">
      <h1 className="history-title">Our History</h1>

      <div
        className={`history-bg ${bg ? "has-image" : ""}`}
        style={bg ? { backgroundImage: `url(${bg})` } : undefined}
        aria-label="History background"
      />

      {allowUpload && (
        <label className="history-upload">
          <input type="file" accept="image/*" onChange={onFileChange} />
          <span>배경 이미지 업로드</span>
        </label>
      )}
    </section>
  );
};

export default History;
