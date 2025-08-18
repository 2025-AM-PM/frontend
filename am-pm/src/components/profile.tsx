import "../styles/profile.css";

type KV = { key: string; value: string };
interface Props {
  name: string;
  role: string;
  summary: string;
  links?: { label: string; href: string }[];
  kv?: KV[];
  skills?: string[];
  avatarSrc?: string;
}

export default function ProfileCard({
  name,
  role,
  summary,
  links = [],
  kv = [],
  skills = [],
  avatarSrc,
}: Props) {
  return (
    <section id="profile" className="section">
      <div className="container">
        <h2 className="section-title">Profile</h2>
        <p className="section-desc">핵심 소개와 이력을 요약한다.</p>

        <div className="profile-grid">
          <div className="card" aria-label="Profile Summary">
            <img
              className="avatar"
              src={avatarSrc || "/avatar.jpg"}
              alt={`${name} avatar`}
            />
            <h3 style={{ margin: "16px 0 4px" }}>{name}</h3>
            <div style={{ color: "var(--sub)", marginBottom: 12 }}>{role}</div>
            <p>{summary}</p>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>

          <div className="card" aria-label="Details">
            <h4 style={{ marginTop: 0 }}>기본 정보</h4>
            <div className="kv" role="list">
              {kv.map((row) => (
                <div key={row.key} className="kv-row" role="listitem">
                  <div className="kv-key">{row.key}</div>
                  <div>{row.value}</div>
                </div>
              ))}
            </div>
            <h4 style={{ marginTop: 24 }}>Skills</h4>
            <div className="tags">
              {skills.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
