import "../styles/header.css";
import { NavLink, useLocation } from "react-router-dom";
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
  }, [location.pathname]);

  // 현재 경로 매칭 유틸 (exact 또는 하위 경로 포함)
  const isCurrentPath = (base: string, exact = false) => {
    const path = location.pathname;
    if (exact) return path === base;
    return path === base || path.startsWith(base + "/");
  };

  return (
    <header className="header">
      <div className="container">
        {/* 로고 */}
        <div className="logo" />

        {/* 네비바 (BEM 구조) */}
        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">
            <li
              className={
                "nav__item" +
                (isCurrentPath("/", true) ? " nav__item--current" : "")
              }
            >
              <NavLink to="/" end className="nav__link">
                홈
              </NavLink>
            </li>

            <li
              className={
                "nav__item" +
                (isCurrentPath("/projects") ? " nav__item--current" : "")
              }
            >
              <NavLink to="/projects" className="nav__link">
                프로젝트 자랑
              </NavLink>
            </li>

            <li
              className={
                "nav__item" +
                (isCurrentPath("/rank") ? " nav__item--current" : "")
              }
            >
              <NavLink to="/rank" className="nav__link">
                백준 랭크
              </NavLink>
            </li>

            <li
              className={
                "nav__item" +
                (isCurrentPath("/polls") ? " nav__item--current" : "")
              }
            >
              <NavLink to="/polls" className="nav__link">
                투표
              </NavLink>
            </li>

            {/* 드롭다운: 게시판 */}
            <li
              className={
                "nav__item nav__item--has-submenu" +
                (isCurrentPath("/boards") ? " nav__item--current" : "")
              }
            >
              <NavLink
                to="/boards"
                className="nav__link"
                aria-haspopup="true"
                aria-expanded={isCurrentPath("/boards") ? true : undefined}
              >
                게시판
              </NavLink>
              <ul className="nav__submenu" role="menu">
                <li className="nav__submenu-item" role="none">
                  <NavLink
                    to="/boards/study"
                    className="nav__submenu-link"
                    role="menuitem"
                  >
                    스터디
                  </NavLink>
                </li>
                <li className="nav__submenu-item" role="none">
                  <NavLink
                    to="/boards/notice"
                    className="nav__submenu-link"
                    role="menuitem"
                  >
                    공지사항
                  </NavLink>
                </li>
                <li className="nav__submenu-item" role="none">
                  <NavLink
                    to="/boards/jobs"
                    className="nav__submenu-link"
                    role="menuitem"
                  >
                    취업정보
                  </NavLink>
                </li>
                <li className="nav__submenu-item" role="none">
                  <NavLink
                    to="/boards/school"
                    className="nav__submenu-link"
                    role="menuitem"
                  >
                    학교정보
                  </NavLink>
                </li>
              </ul>
            </li>

            {user && user.role && user.role !== "USER" && (
              <li
                className={
                  "nav__item" +
                  (isCurrentPath("/admin") ? " nav__item--current" : "")
                }
              >
                <NavLink to="/admin" className="nav__link">
                  관리자
                </NavLink>
              </li>
            )}
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
