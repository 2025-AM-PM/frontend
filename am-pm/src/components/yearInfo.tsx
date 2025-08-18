import "../styles/timeline.css";

export type TimelineItem = {
  year: number;
  title: string;
  description?: string;
  badges?: string[];
  link?: string;
};
export default function YearInfographic({ items }: { items: TimelineItem[] }) {
  return (
    <section id="timeline" className="section">
      <div className="container">
        <h2 className="section-title">연도 인포그래픽</h2>
        <p className="section-desc">연도별 주요 마일스톤을 한 눈에 파악한다.</p>
        <div className="timeline">
          {items.map((it) => (
            <article key={`${it.year}-${it.title}`} className="timeline-item">
              <div className="timeline-year">{it.year}</div>
              <div className="timeline-title">
                {it.link ? (
                  <a href={it.link} target="_blank" rel="noreferrer">
                    {it.title} ↗
                  </a>
                ) : (
                  it.title
                )}
              </div>
              {it.description && (
                <div className="timeline-desc">{it.description}</div>
              )}
              {it.badges?.length ? (
                <div className="timeline-badges">
                  {it.badges.map((b) => (
                    <span key={b} className="badge">
                      {b}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
