import "../styles/clock.css";
import { useState, useEffect } from "react";

// Props 타입 정의
interface CountdownTimerProps {
  initialSeconds: number;
}

export function Clock({ initialSeconds }: CountdownTimerProps) {
  // 남은 시간을 상태로 관리
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  // initialSeconds prop이 변경될 때마다 타이머 상태를 업데이트
  useEffect(() => {
    setRemainingSeconds(initialSeconds);
  }, [initialSeconds]);

  // 카운트다운 로직
  useEffect(() => {
    // 남은 시간이 0 이하면 인터벌을 실행하지 않음
    if (remainingSeconds <= 0) {
      return;
    }

    // 1초마다 남은 시간을 1씩 감소시키는 인터벌 설정
    const interval = setInterval(() => {
      setRemainingSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    // 컴포넌트가 언마운트되거나 remainingSeconds가 변경되면 인터벌 정리
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days.toString().padStart(2, "0")}:${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      {/* 타이머 디스플레이 */}
      <div className="neon-clock-container">
        <div
          className={`neon-clock ${
            remainingSeconds === 0 ? "timer-finished" : ""
          }`}
        >
          {formatTimer(remainingSeconds)}
        </div>
      </div>
    </div>
  );
}
