import "../styles/background.css";
import { useState, useEffect } from "react";
import background1 from "../assets/background1.jpg";
import background2 from "../assets/background2.jpg";
import background3 from "../assets/background3.jpg";

const images = [background1, background2, background3];

function Background() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-main">
      {/* 모든 이미지를 렌더링하고 겹쳐놓습니다. */}
      {images.map((image, index) => (
        <div
          key={index}
          className="hero-background"
          style={{
            backgroundImage: `url(${image})`,
            // 현재 인덱스와 일치하는 이미지만 불투명하게 만듭니다.
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>Algorithm Master Programming Master</h1>
        <p>전북대학교 소프트웨어공학과 과동아리 AM:PM</p>
      </div>
    </div>
  );
}

export default Background;
