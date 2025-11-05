import { useAuthStore } from "../stores/authStore";
import "../styles/user.css";
import { Link } from "react-router-dom";

function UserInfo({
  name,
  rank,
}: {
  name: string | null;
  rank: string | null;
}) {
  let rankImgSrc = "";
  try {
    rankImgSrc = require(`../assets/${rank}.png`);
  } catch (e) {
    rankImgSrc = require(`../assets/noob.png`);
  }

  return (
    <div className="user">
      {rankImgSrc && (
        <img src={rankImgSrc} alt={rank || undefined} className="tier" />
      )}

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
