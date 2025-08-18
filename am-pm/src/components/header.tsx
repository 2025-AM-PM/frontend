// import "../styles/header.css";
// import { Routes, Route, NavLink, useLocation } from "react-router-dom";
// import User from "./User";
// import { Session } from "../types";

// export const fakeUser: Session = {
//   userId: "202010957",
//   userName: "한준서",
//   userTier: "gold",
// };

// function Header() {
//   const location = useLocation();
//   return (
//     <header className="header">
//       <div className="container">
//         {/* 로고 */}
//         <div className="logo"></div>
//         {/* 네비바 */}
//         <nav className="nav">
//           <ul className="nav-list">
//             <li
//               className={`nav-item${
//                 location.pathname === "/" ? " nav-item-current" : ""
//               }`}
//             >
//               <NavLink to="/" end>
//                 홈{" "}
//               </NavLink>
//             </li>
//             <li
//               className={`nav-item${
//                 location.pathname === "/projects" ? " nav-item-current" : ""
//               }`}
//             >
//               <NavLink to="/projects">프로젝트 자랑</NavLink>
//             </li>
//             <li
//               className={`nav-item${
//                 location.pathname === "/rank" ? " nav-item-current" : ""
//               }`}
//             >
//               <NavLink to="/rank">백준 랭크</NavLink>
//             </li>
//           </ul>
//         </nav>
//         {/* 유저 정보 */}
//         <div className="user">
//           <User name={fakeUser.userName} rank={fakeUser.userTier} />
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

import { useEffect, useState } from "react";
import "../styles/header.css";

export default function Header() {
  const [hash, setHash] = useState<string>(window.location.hash || "#home");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const Item = ({ href, label }: { href: string; label: string }) => (
    <a href={href} className={hash === href ? "active" : ""}>
      {label}
    </a>
  );

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">AMP M • New</div>
        <nav className="nav" aria-label="Global">
          <Item href="#home" label="Home" />
          <Item href="#timeline" label="연도 인포그래픽" />
          <Item href="#profile" label="Profile" />
          <Item href="#contact" label="Contact" />
        </nav>
      </div>
    </header>
  );
}
