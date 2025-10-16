import Header from "./header";
import { useMemo, useState } from "react";
import "../styles/project.css"; // 기존 타이틀/필터 CSS 계속 사용
import { ProjectCardProps } from "../components/projectCard";
import ProjectsGrid from "../components/projectGrid";
import projectJson from "../assets/json/test.json";

type ProjectType = {
  id: number;
  title: string;
  year: number;
  images: string[];
  description: string;
  // 필요하면 여기서 확장: category/tags/emoji/href ...
};

// 우리 카드에 year를 덧댄 로컬 타입(필터용)
type ProjectCardWithYear = ProjectCardProps & { year: number };

const raw: ProjectType[] = projectJson as ProjectType[];

function Project() {
  // const [raw, setRaw] = useState<ProjectType[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [error] = useState<string | null>(null);

  // useEffect(() => {
  //   fetch("../assets/json/project.json")
  //     .then((res) => {
  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       return res.json() as Promise<ProjectType[]>;
  //     })
  //     .then((data) => setRaw(data))
  //     .catch((err) => {
  //       console.error("Error fetching data:", err);
  //       setError("프로젝트 데이터를 불러오지 못했습니다.");
  //     });
  // }, []);

  // 연도 목록 (raw는 모듈 상수이므로 deps 불필요)  // [CHANGED]
  const years = useMemo(
    () => Array.from(new Set(raw.map((p) => p.year))).sort((a, b) => b - a),
    [] // [CHANGED]
  );

  // 🔁 ProjectType -> ProjectCardWithYear 변환 함수
  const toCard = (p: ProjectType): ProjectCardWithYear => ({
    title: p.title,
    summary: p.description,
    cover: p.images?.[0] ?? "/placeholder.png", // 첫 이미지 또는 폴백
    date: String(p.year), // 그리드에서 표시용으로 쓸 수 있음
    // 필요 시 아래 필드들도 매핑:
    // category: p.category,
    // tags: p.tags,
    // emoji: p.emoji,
    // href: p.link,
    year: p.year,
  });

  // 필터링 + 매핑 (raw는 상수이므로 selectedYear만 의존)  // [CHANGED]
  const cards = useMemo(() => {
    const src =
      selectedYear === "all" ? raw : raw.filter((p) => p.year === selectedYear);
    return src.map(toCard);
  }, [selectedYear]); // [CHANGED]

  const handleYearClick = (y: number | "all") => setSelectedYear(y);

  return (
    <>
      <Header />

      {/* 기존 타이틀/서브타이틀은 유지 */}
      <div className="project-title-group">
        <div className="project-title">프로젝트</div>
        <div className="project-subtitle">
          지금까지 진행한 프로젝트들을 구경해보세요!
        </div>
      </div>

      {/* 연도 필터 */}
      <div className="filter-bar">
        <button
          className={`pill-btn ${selectedYear === "all" ? "active" : ""}`}
          onClick={() => handleYearClick("all")}
        >
          전체
        </button>
        {years.map((y) => (
          <button
            key={y}
            className={`pill-btn ${selectedYear === y ? "active" : ""}`}
            onClick={() => handleYearClick(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {/* 그리드: 우리가 만든 카드 컴포넌트로 렌더 */}
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <ProjectsGrid projects={cards} />
      )}
    </>
  );
}

export default Project;
