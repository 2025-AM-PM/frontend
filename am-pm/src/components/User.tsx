import calculateTier from "../lib/calculateTier";
import { useAuthStore } from "../stores/authStore";
import "../styles/user.css";
import { Link } from "react-router-dom";

function UserInfo({ name, rank }: { name: string | null; rank: number | 0 }) {
  let rankImgSrc = "";
  let tierImage = calculateTier(rank);
  try {
    rankImgSrc = require(`../assets/${tierImage}.png`);
  } catch (e) {
    rankImgSrc = require(`../assets/noob.png`);
  }

  return (
    <div className="user">
      {rankImgSrc && <img src={rankImgSrc} alt={tierImage} className="tier" />}

      <Link to="/mypage" className="user-name-link">
        <span className="user-name">{name}</span>
      </Link>

      <Link to="/login" onClick={useAuthStore.getState().logOut}>
        로그아웃
      </Link>
    </div>
  );
}

export default UserInfo;
