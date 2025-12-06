import Header from "../components/header";
import "../styles/home.css";
import Board from "../components/board";
import Clock from "../components/clock";
import Background from "../components/background";
import History from "../components/history";
import timeline from "../assets/history.png";
import { ProjectCardProps } from "../components/projectCard";
import ProjectsGrid from "../components/projectGrid";
import study from "../assets/study.jpg";
import hackerthon from "../assets/hackerthone.jpg";
import skSubmit from "../assets/skSubmit.jpg";
import Footer from "../components/Footer";

function HomePage() {
  const projects: ProjectCardProps[] = [
    {
      title: "멘토 멘티 스터디",
      summary:
        "신입 부원들을 대상으로 한 대회입니다. 선후배 간 의 멘토링을 통해 함께 성장하는 기회를 제공합니다.",
      cover: study,
      category: "대회",
      emoji: "🌱",
      date: "2025.03.11",
      tags: ["입문", "스터디"],
      href: "#",
    },
    {
      title: "개발자 컨퍼런스",
      summary:
        "개발자들이 모여 최신 기술과 트렌드를 공유하는 컨퍼런스입니다. 다양한 세션과 네트워킹 기회를 제공합니다.",
      cover: skSubmit,
      category: "행사",
      emoji: "🎮",
      date: "2025.03.01",
      tags: ["AI", "SKT"],
      href: "#",
    },
    {
      title: "해커톤",
      summary:
        "팀원들과 함께 주어진 주제에 대한 서비스를 개발하거나 데이터 분석 과제를 수행하는 해커톤…",
      cover: hackerthon,
      category: "해커톤",
      emoji: "💎",
      date: "2024.11.06",
      tags: ["Hackathon"],
      href: "#",
    },
  ];
  return (
    <div className="main">
      <Header />
      <Clock />
      <Background />
      <Board />
      <History backgroundUrl={timeline} allowUpload={false} />
      <h2 className="project-main-title">Our Activities</h2>
      <ProjectsGrid projects={projects} />
      <Footer />
    </div>
  );
}

export default HomePage;
