import React from "react";
import JobPosting, { JobPostingData } from "../components/JobPosting";
import "../styles/JobPosting.css"; // Make sure styles are loaded if not global

const sampleJob1: JobPostingData = {
  회사이름: "NEXON",
  포지션: "프론트엔드 개발자 (신입/경력)",
  "회사 위치": "성남시 분당구",
  "자격 요건": [
    "React, TypeScript 능숙자",
    "HTML/CSS 웹 표준 및 접근성 이해",
    "Git 협업 경험",
  ],
  주요업무: [
    "게임 웹 서비스 개발 및 유지보수",
    "공통 UI 라이브러리 개발",
    "성능 최적화 및 UX 개선",
  ],
  employmentType: "정규직",
  datePosted: "2025-12-01",
  occupationalCategory: ["Software Engineer"],
  validThrough: "2025-12-31",
  experienceRequirements: ["3년 이상", "경력"],
  url: "https://example.com/apply",
};

const sampleJob2: JobPostingData = {
  회사이름: null,
  포지션: "백엔드 개발자",
  "회사 위치": "서울 강남구",
  "자격 요건": ["Java, Spring Boot 경험", "AWS 클라우드 환경 이해"],
  주요업무: ["API 서버 설계 및 구현", "데이터베이스 스키마 설계"],
  employmentType: "계약직",
  datePosted: "2025-12-05",
  occupationalCategory: [],
  validThrough: null,
  experienceRequirements: ["신입"],
  url: null,
};

const JobPostingDemo = () => {
  return (
    <div style={{ background: "#13161c", minHeight: "100vh" }}>
      <JobPosting data={sampleJob1} />
    </div>
  );
};

export default JobPostingDemo;
