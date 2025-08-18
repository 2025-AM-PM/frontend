// import React from "react";
// import Header from "../components/header";
// import "../styles/home.css";
// import Board from "../components/board";
// import { Clock } from "../components/clock";
// import Background from "../components/background";

// function HomePage() {
//   return (
//     <div className="main">
//       <Header />
//       <Clock initialSeconds={3186254} />
//       <Background />
//       <Board />
//     </div>
//   );
// }

// export default HomePage;

export default function Home() {
  return (
    <section id="home" className="section" aria-label="Hero">
      <div className="container" style={{ display: "grid", gap: 18 }}>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          심플 원페이지 디자인
        </h1>
        <p className="section-desc">
          Hero → 연도 인포그래픽 → Profile → Footer 순으로 구성한다.
        </p>
        <div
          style={{
            background: "linear-gradient(180deg,#f7faff,#ffffff)",
            border: "1px solid var(--muted)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: 22,
          }}
        >
          <b>포인트</b> — 상단 고정 내비, 카드형 레이아웃, 차분한 라이트 톤으로
          참고 사이트 대비 가독성을 높인다.
        </div>
      </div>
    </section>
  );
}
