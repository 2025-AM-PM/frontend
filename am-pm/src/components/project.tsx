import Header from "./header";
import '../styles/project.css';
import React, { useEffect, useState, useMemo } from "react";

type ProjectType = {
  id: number;
  title: string;
  year: number;
  images: string[];
  description: string;
};

function Project() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/project.json")
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("프로젝트 데이터를 불러오지 못했습니다.");
      });
  }, []);

  // 연도 목록 캐싱
  const years = useMemo(
    () => Array.from(new Set(projects.map(p => p.year))).sort((a, b) => b - a),
    [projects]
  );

  // 필터링된 프로젝트 캐싱
  const filteredProjects = useMemo(
    () =>
      selectedYear === "all"
        ? projects
        : projects.filter(p => p.year === selectedYear),
    [projects, selectedYear]
  );

  const handleYearClick = (year: number | "all") => setSelectedYear(year);

  return (
    <>
      <Header />
      <div className="project-title-group">
        <div className="project-title">프로젝트</div>
        <div className="project-subtitle">지금까지 진행한 프로젝트들을 구경해보세요!</div>
      </div>
      <div className="filter-bar">
        <button
          className={`pill-btn ${selectedYear === "all" ? "active" : ""}`}
          onClick={() => handleYearClick("all")}
        >
          전체
        </button>
        {years.map(y => (
          <button
            key={y}
            className={`pill-btn ${selectedYear === y ? "active" : ""}`}
            onClick={() => handleYearClick(y)}
          >
            {y}
          </button>
        ))}
      </div>
      <div className="project-list">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <img
                src={project.images[0]}
                alt={project.title}
                className="project-image"
              />
              <div className="project-overlay">
                <div className="project-card-title">{project.title}</div>
                <div className="project-desc">{project.description}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Project;
