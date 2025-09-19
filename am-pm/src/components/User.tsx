import { logout } from "../api/auth";
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
      <span className="user-name">{name}</span>
      <Link to="./login" onClick={logout}>
        로그아웃
      </Link>
    </div>
  );
}

export default UserInfo;
