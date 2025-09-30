import "../styles/header.css";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import UserInfo from "./User";
import { User } from "../types";
import LoginBtn from "./loginBtn";
// ⬇️ 로컬 스토리지 유틸만 사용
import { getStoredUser } from "../api/storage";
import { useEffect, useState } from "react";

function Header() {
  const location = useLocation();

  // 로컬 스토리지에서 즉시 하이드레이션
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  // 라우트 변경/탭 포커스/스토리지 변경 시 동기화
  useEffect(() => {
    const sync = () => setUser(getStoredUser<User>());
    // 1) 라우트 변경마다 동기화
    sync();
    // 2) 다른 탭에서 변경되면 반영
    window.addEventListener("storage", sync);
    // 3) 창에 다시 포커스 들어올 때 동기화
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
    // location.pathname이 바뀔 때마다 재동기화
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="container">
        {/* 로고 */}
        <div className="logo"></div>

        {/* 네비바 */}
        <nav className="nav">
          <ul className="nav-list">
            <li
              className={`nav-item${
                location.pathname === "/" ? " nav-item-current" : ""
              }`}
            >
              <NavLink to="/" end>
                홈
              </NavLink>
            </li>
            <li
              className={`nav-item${
                location.pathname === "/projects" ? " nav-item-current" : ""
              }`}
            >
              <NavLink to="/projects">프로젝트 자랑</NavLink>
            </li>
            <li
              className={`nav-item${
                location.pathname === "/rank" ? " nav-item-current" : ""
              }`}
            >
              <NavLink to="/rank">백준 랭크</NavLink>
            </li>
            <li
              className={`nav-item${
                location.pathname === "/polls" ? " nav-item-current" : ""
              }`}
            >
              <NavLink to="/polls">투표</NavLink>
            </li>

            <li
              className={`nav-item${
                location.pathname === "/polls" ? " nav-item-current" : ""
              }`}
            >
              <NavLink to="/boards">게시판</NavLink>
              <ul>
                <li>스터디</li>
                <li>공지사항</li>
                <li>취업정보</li>
                <li>학교정보</li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* 유저 정보 */}
        <div className="user">
          {user ? (
            <UserInfo
              name={user.studentName || ""}
              rank={user.studentTier || ""}
            />
          ) : (
            <LoginBtn />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
