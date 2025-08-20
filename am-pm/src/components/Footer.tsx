import React from "react";
import "../styles/footer.css";

type Contact = { label: string; items: string[] }; // 예) { label: "회장", items: ["장훈성 010-2455-5464"] }

type Props = {
  org?: string;
  startYear?: number; // 예: 2020
  address?: string;
  email?: string;
  credits?: string[]; // "2024 Ver. Created by ..." 같은 줄들
  socials?: {
    name: "instagram" | "facebook" | "twitter" | "youtube";
    href: string;
  }[];
  contacts?: Contact[]; // 오른쪽 열(회장/부회장)
};

const Footer: React.FC<Props> = ({
  org = "KUCC",
  startYear = 2020,
  address = "서울특별시 성북구 고려대로 105, 고려대학교 자연계캠퍼스 과학도서관 314호",
  email = "anamkucc314@gmail.com",
  credits = [
    "Made with ♥ by KUCC",
    "2020 Ver.",
    "2024 Ver. Created by 팀 이민승, 김현서, 김재린, 문준호, 현지수, 주찬혁, 박기동",
  ],
  socials = [
    { name: "instagram", href: "#" },
    { name: "facebook", href: "#" },
    { name: "twitter", href: "#" },
    { name: "youtube", href: "#" },
  ],
  contacts = [
    { label: "회장", items: ["장훈성 010-2455-5464"] },
    {
      label: "부회장",
      items: ["신서현 010-6608-9457", "이종현 010-5043-6804"],
    },
  ],
}) => {
  const year = new Date().getFullYear();
  const range =
    startYear && startYear < year ? `${startYear}–${year}` : `${year}`;

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-top">
        <div className="copyright">Copyright © {org} All Rights Reserved.</div>
        <nav className="socials" aria-label="소셜 링크">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.name}
            >
              <SvgIcon name={s.name} />
            </a>
          ))}
        </nav>
      </div>

      <div className="divider" aria-hidden />

      <div className="container footer-main">
        <div className="left">
          <div className="credit-lines">
            {credits.map((line, i) => (
              <div key={i} className="credit-line">
                {line}
              </div>
            ))}
          </div>
          <div className="org-info">
            <div>{address}</div>
            <div>{email}</div>
            <div className="muted">Since {range}</div>
          </div>
        </div>

        <div className="right">
          {contacts.map((c) => (
            <div key={c.label} className="contact-col">
              <div className="contact-label">{c.label}</div>
              {c.items.map((t, i) => (
                <div key={i} className="contact-item">
                  {t}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

/* --- 간단한 인라인 아이콘 --- */
function SvgIcon({
  name,
}: {
  name: "instagram" | "facebook" | "twitter" | "youtube";
}) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };
  switch (name) {
    case "instagram":
      return (
        <svg {...common} aria-hidden>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 4.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5Zm5.75-4.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} aria-hidden>
          <path d="M13 22V13h3l1-3h-4V8.5A1.5 1.5 0 0 1 14.5 7H17V4h-2.5A4.5 4.5 0 0 0 10 8.5V10H7v3h3v9z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...common} aria-hidden>
          <path d="M22 5.8a7.2 7.2 0 0 1-2 .6 3.5 3.5 0 0 0 1.5-1.9 7.1 7.1 0 0 1-2.2.9A3.6 3.6 0 0 0 12 7.9a10.2 10.2 0 0 1-7.4-3.7 3.6 3.6 0 0 0 1.1 4.8 3.5 3.5 0 0 1-1.7-.5v.1a3.6 3.6 0 0 0 2.9 3.5 3.5 3.5 0 0 1-1.6.1 3.6 3.6 0 0 0 3.4 2.5A7.2 7.2 0 0 1 3 17.6a10.1 10.1 0 0 0 15.6-8.6v-.5A7.3 7.3 0 0 0 22 5.8z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} aria-hidden>
          <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C18 5 12 5 12 5s-6 0-7.6.2a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2C6 19 12 19 12 19s6 0 7.6-.2a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8zM10 15V9l5 3z" />
        </svg>
      );
  }
}
