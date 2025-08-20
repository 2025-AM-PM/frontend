import { useEffect, useMemo, useState } from "react";
import "../styles/clock.css";

const STORAGE_KEY = "clock_target_iso";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatDiff(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${pad2(days)}:${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}
function formatClock(now: Date) {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
    now.getSeconds()
  )}`;
}

export default function Clock() {
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [targetMs, setTargetMs] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Date(saved).getTime() : null;
  });

  // 1초마다 갱신
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // diff 또는 현재시각 문자열
  const text = useMemo(() => {
    if (targetMs) {
      // ✅ 지난 경우는 0으로 고정(절대값 사용 금지)
      const delta = Math.round((targetMs - nowMs) / 1000); // 남은 초 (미래: 양수, 과거: 음수)
      const diffSec = Math.max(0, delta); // 0 미만이면 0으로 클램프
      return formatDiff(diffSec);
    }
    return formatClock(new Date(nowMs));
  }, [targetMs, nowMs]);

  return (
    <div className="clock-only">
      <span className="digits">{text}</span>
    </div>
  );
}
