import React from "react";
import Header from "../components/header";
import "../styles/home.css";
import Board from "../components/board";
import Clock from "../components/clock";
import Background from "../components/background";
import History from "../components/history";
import timeline from "../assets/history.png";

function HomePage() {
  return (
    <div className="main">
      <Header />
      <Clock />
      <Background />
      <Board />
      <History backgroundUrl={timeline} allowUpload={false} />
    </div>
  );
}

export default HomePage;
