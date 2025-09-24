import { useEffect, useState } from "react";
import Header from "./header";
import '../styles/rank.css'; 

type RankItem = {
  name: string;
  correct: number;
  submissions: number;
};

function Rank() {
  const [rankData, setRankData] = useState<RankItem[]>([]);

  useEffect(() => {
    fetch("/rank.json")
      .then((res) => res.json())
      .then((data) => setRankData(data))
      .catch((err) => console.error("랭킹 데이터를 불러오지 못했습니다.", err));
  }, []);

  const getBackgroundColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FDC500";
      case 2:
        return "#C0C0C0"; 
      case 3:
        return "#8B6A33"; 
      default:
        return "#fff";   
    }
  };

  return (
    <div className="rank-container">
      <Header />
      <h1 className="rank-title">랭킹</h1>
      <div className="rank-list">
        {rankData.map((item, index) => (
          <div key={index} 
          className="rank-item" 
          style={{ backgroundColor: getBackgroundColor(index + 1) }}
          >
            <div className="rank-left">
              <div className="rank-number">{index + 1}</div>
              <div className="rank-name">
                {item.name}
              </div>
            </div>
            <div className="rank-stats">
              <span>맞은 문제 <span className="stat-number">{item.correct}</span></span>
              <span>제출 <span className="stat-number">{item.submissions}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rank;