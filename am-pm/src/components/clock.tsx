import "../styles/clock.css";
import { useState, useEffect } from "react";

// Props 타입 정의
interface CountdownTimerProps {
  initialSeconds: number;
}

export function Clock({ initialSeconds }: CountdownTimerProps) {
  // localStorage에 목표 시간을 저장할 키
  const storageKey = "countdownTargetTimestamp";

  // 컴포넌트가 처음 로드될 때 실행되어 초기 남은 시간을 계산하는 함수
  const getInitialRemainingSeconds = () => {
    // 저장된 목표 시간을 가져옴
    const savedTargetTimestamp = localStorage.getItem(storageKey);

    // 저장된 목표 시간이 없다면 (최초 실행)
    if (!savedTargetTimestamp) {
      // 현재 시간을 기준으로 새로운 목표 시간을 계산
      const newTargetTimestamp = new Date().getTime() + initialSeconds * 1000;
      // 새로운 목표 시간을 localStorage에 저장
      localStorage.setItem(storageKey, String(newTargetTimestamp));
      // 초기 시간(초)을 그대로 반환
      return initialSeconds;
    }

    // 저장된 목표 시간이 있다면 (새로고침)
    // 목표 시간과 현재 시간의 차이를 계산하여 남은 시간을 구함
    const remaining = Math.round(
      (Number(savedTargetTimestamp) - new Date().getTime()) / 1000
    );

    // 남은 시간이 0보다 작으면 0을 반환, 아니면 남은 시간을 반환
    return remaining > 0 ? remaining : 0;
  };

  // 위 함수를 통해 계산된 값으로 상태를 초기화
  const [remainingSeconds, setRemainingSeconds] = useState(
    getInitialRemainingSeconds
  );

  // 카운트다운 로직
  useEffect(() => {
    // 남은 시간이 0 이하면 인터벌을 실행하지 않고 localStorage의 값도 삭제
    if (remainingSeconds <= 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    // 1초마다 남은 시간을 1씩 감소시키는 인터벌 설정
    const interval = setInterval(() => {
      setRemainingSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    // 컴포넌트가 언마운트되거나 remainingSeconds가 변경되면 인터벌 정리
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // 초를 DD:HH:MM:SS 형식으로 변환하는 함수
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
