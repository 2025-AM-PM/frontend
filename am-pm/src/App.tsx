// import React from 'react';
// import { Routes, Route, Link } from 'react-router-dom';
// import HomePage from './pages/Home';
// import Project from './components/project';
// import './App.css';
// import Rank from './components/rank';

// function App() {
//   return (
//     <Routes>
//       <Route path='/' element={<HomePage />} />
//       <Route path='/projects' element={<Project />} />
//       <Route path='/rank' element={<Rank />} />
//     </Routes>
//   );
// }

// export default App;

import "./App.css";
import Header from "./components/header";
import Home from "./pages/Home";
import YearInfographic, { TimelineItem } from "./components/yearInfo";
import ProfileCard from "./components/profile";
import Footer from "./components/Footer";

export default function App() {
  const timeline: TimelineItem[] = [
    {
      year: 2022,
      title: "프로젝트 시작",
      description: "기술 스택 선정",
      badges: ["React", "TypeScript"],
    },
    {
      year: 2023,
      title: "v1.0 런칭",
      description: "첫 배포",
      badges: ["CI/CD", "Vercel"],
    },
    {
      year: 2024,
      title: "콘텐츠 확장",
      description: "연혁/포트폴리오 도입",
      badges: ["UX 개선"],
    },
    {
      year: 2025,
      title: "New 디자인 적용",
      description: "연도 인포그래픽+프로필+푸터",
      badges: ["Accessibility", "Responsive"],
    },
  ];

  return (
    <>
      <Header />
      <main>
        <Home />
        <YearInfographic items={timeline} />
        <ProfileCard
          name="홍길동"
          role="Frontend Engineer"
          summary="사용성 높은 프론트엔드 제품을 만든다."
          links={[
            { label: "GitHub", href: "https://github.com/yourname" },
            { label: "Portfolio", href: "#" },
          ]}
          kv={[
            { key: "Email", value: "you@example.com" },
            { key: "Location", value: "Jeonju, KR" },
            { key: "Interests", value: "웹서비스, 시각화, 최적화" },
          ]}
          skills={["React", "TypeScript", "Vite", "Jest", "Node.js", "Docker"]}
        />
      </main>
      <Footer />
    </>
  );
}
