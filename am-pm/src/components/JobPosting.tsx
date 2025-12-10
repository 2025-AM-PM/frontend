import React from "react";
import Header from "./header";
import "../styles/JobPosting.css";

export interface JobPostingData {
  회사이름: string | null;
  포지션: string | null;
  "회사 위치": string | null;
  "자격 요건": string[];
  주요업무: string[];
  employmentType: string | null;
  datePosted: string | null;
  occupationalCategory: string[];
  validThrough: string | null;
  experienceRequirements: string[];
  url: string | null;
}

interface JobPostingProps {
  data: JobPostingData;
}

const formatDate = (isoString: string | null) => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
};

const JobPosting: React.FC<JobPostingProps> = ({ data }) => {
  return (
    <section className="post-detail">
      <Header />
      <div className="pd-container">
        {/* 타이틀 블록 */}
        <header className="pd-head">
          <div className="pd-title-row">
            <h1 className="pd-title">
              [{data.회사이름 || "Unknown Company"}]{" "}
              {data.포지션 || "Open Position"}
            </h1>
          </div>

          <div className="pd-meta">
            <span className="pd-meta__item">작성자: SYSTEM_ADMIN</span>
            <span className="pd-meta__item">
              게시일: {formatDate(data.datePosted)}
            </span>
            <span className="pd-meta__item">
              마감일:{" "}
              {data.validThrough ? formatDate(data.validThrough) : "상시채용"}
            </span>
          </div>

          <hr className="pd-divider" />
        </header>

        {/* 본문 (Schema Fields) */}
        <article className="pd-body markdown-body job-content">
          <div className="job-summary-table">
            <div className="summary-row">
              <span className="summary-label">회사 위치</span>
              <span className="summary-value">{data["회사 위치"] || "-"}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">고용 형태</span>
              <span className="summary-value">
                {data.employmentType || "-"}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">경력 요건</span>
              <span className="summary-value">
                {data.experienceRequirements.length > 0
                  ? data.experienceRequirements.join(", ")
                  : "-"}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">직무 카테고리</span>
              <span className="summary-value">
                {data.occupationalCategory.length > 0
                  ? data.occupationalCategory.join(", ")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="job-section">
            <h2>🚀 주요 업무</h2>
            <ul>
              {data.주요업무.length > 0 ? (
                data.주요업무.map((item, index) => <li key={index}>{item}</li>)
              ) : (
                <li>상세 내용 없음</li>
              )}
            </ul>
          </div>

          <div className="job-section">
            <h2>🎯 자격 요건</h2>
            <ul>
              {data["자격 요건"].length > 0 ? (
                data["자격 요건"].map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>상세 내용 없음</li>
              )}
            </ul>
          </div>
        </article>

        {/* 하단 버튼 */}
        <footer
          className="pd-vote"
          style={{ justifyContent: "center", marginTop: "40px" }}
        >
          {data.url ? (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-btn-large"
            >
              지원하러 가기
            </a>
          ) : (
            <button disabled className="apply-btn-large disabled">
              지원 불가
            </button>
          )}
        </footer>
      </div>
    </section>
  );
};

export default JobPosting;
