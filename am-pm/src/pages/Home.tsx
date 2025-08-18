import React from "react";
import Header from "../components/header";
import "../styles/home.css";
import Board from "../components/board";
import Clock from "../components/clock";
import Background from "../components/background";

function HomePage() {
  return (
    <div className="main">
      <Header />
      <Clock />
      <Background />
      <Board />
    </div>
  );
}

export default HomePage;
