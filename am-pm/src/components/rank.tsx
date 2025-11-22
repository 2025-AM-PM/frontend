import { useEffect, useState } from "react";
import Header from "./header";
import '../styles/rank.css';
import calculateTier from "../lib/calculateTier";
import { apiFetch } from "../api/client";

type RankItem = {
  studentId: number;
  studentName: string;
  studentNumber: string;
  tier: number;
  solvedCount: number;
  rating: number;
};

function Rank() {
  const [rankData, setRankData] = useState<RankItem[] | null>(null);

  useEffect(() => {
    const getData = async() => {
      const response = await apiFetch<RankItem[]>("/students/tiers", {
      method: "GET",
      auth: false,
    });
    setRankData(response.data);
    };
    getData();
  }, []);

  const getRankClass = (rank: number) => {
    if (rank === 1) return "rank-card top-1";
    if (rank === 2) return "rank-card top-2";
    if (rank === 3) return "rank-card top-3";
    return "rank-card normal";
  };

  const gerTierImage = (tier: number) => {
    const rankImgSrc = require(`../assets/${calculateTier(tier)}.png`);
    return rankImgSrc;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <img src="/assets/gold_wreath.png" alt="1st" className="rank-icon" />;
    if (rank === 2) return <img src="/assets/silver_wreath.png" alt="2nd" className="rank-icon" />;
    if (rank === 3) return <img src="/assets/bronze_wreath.png" alt="3rd" className="rank-icon" />;
    return rank;
  };

  return (
    <div className="rank-container">
      <Header />
      <div className="rank-content">
        <h1 className="rank-title">랭킹</h1>
        <div className="rank-list">
          <div className="rank-header">
            <span>등수</span>
            <span>이름</span>
            <span>학번</span>
            <span>티어</span>
            <span>푼 문제 수</span>
          </div>
          {rankData?.map((item, index) => (
            <div key={index} className={getRankClass(index + 1)}>
              <div className="rank-position">{getRankIcon(index + 1)}</div>
              <div className="rank-name">{item.studentName}</div>
              <div className="rank-id">{item.studentNumber}</div>
              <div className="rank-tier"><img src={gerTierImage(item.tier)} alt={calculateTier(item.tier)} className="rank-tier" /></div>
              <div className="rank-solved">{item.solvedCount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rank;