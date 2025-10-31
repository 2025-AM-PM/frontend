import React from "react";
import "../styles/project-card.css";

export type ProjectCardProps = {
  title: string;
  summary: string;
  cover: string; // 썸네일 이미지 URL
  href?: string; // 카드 클릭 시 이동할 링크
  date?: string; // "2025.03.12" 또는 "2025-03-12"
  category?: string; // 예: "공지", "세미나"
  tags?: string[]; // 선택 태그들
  emoji?: string; // 소제목 앞에 올 이모지 (예: "🎮")
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  summary,
  cover,
  href,
  date,
  category,
  tags = [],
  emoji,
}) => {
  const CardInner = (
    <article className="p-card" aria-label={title}>
      <div className="p-cover">
        <img src={cover} alt="" loading="lazy" />
        <div className="p-grad"></div>
        <h3 className="p-title">{title}</h3>
      </div>

      <div className="p-body">
        {(emoji || category) && (
          <div className="p-row p-subtitle">
            {emoji && (
              <span className="p-emoji" aria-hidden>
                {emoji}
              </span>
            )}
            {category && <span className="p-chip">{category}</span>}
          </div>
        )}
        <p className="p-summary">{summary}</p>

        {(date || tags.length > 0) && (
          <div className="p-meta">
            {date && <span className="p-date">{date}</span>}
            {tags.length > 0 && (
              <div className="p-tags">
                {tags.map((t) => (
                  <span key={t} className="p-tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );

  return href ? (
    <a className="p-link" href={href} target="_blank" rel="noreferrer">
      {CardInner}
    </a>
  ) : (
    CardInner
  );
};

export default ProjectCard;
