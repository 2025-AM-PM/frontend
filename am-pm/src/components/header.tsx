import "../styles/header.css";
import { NavLink, useLocation } from "react-router-dom";
import UserInfo from "./User";
import LoginBtn from "./loginBtn";
import { useAuthStore } from "../stores/authStore";

function Header() {
  const location = useLocation();
  const user = useAuthStore.getState().user;

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
                to="/board/info/write"
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
              rank={user.studentTier || 0}
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
