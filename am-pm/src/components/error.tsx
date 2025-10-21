import { Link } from "react-router-dom";
import "../styles/error.css";

export default function ErrorPage() {
  return (
    <div>
      <main role="main">
        {/* 404 */}
        <section id="error-404" className={`error-section`}>
          <div className="error-container">
            <div className="illustration-wrapper">
              {/* Penguin with flashlight */}
              <svg
                className="penguin"
                viewBox="0 0 200 240"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Body */}
                <ellipse cx="100" cy="140" rx="60" ry="75" fill="#2C3E50" />
                <ellipse cx="100" cy="140" rx="45" ry="60" fill="#FFFFFF" />

                {/* Head */}
                <ellipse cx="100" cy="70" rx="50" ry="55" fill="#2C3E50" />

                {/* Eyes */}
                <ellipse cx="85" cy="65" rx="12" ry="14" fill="#FFFFFF" />
                <ellipse cx="115" cy="65" rx="12" ry="14" fill="#FFFFFF" />
                <circle cx="87" cy="68" r="6" fill="#13161C" />
                <circle cx="117" cy="68" r="6" fill="#13161C" />
                <circle cx="89" cy="66" r="2" fill="#FFFFFF" />
                <circle cx="119" cy="66" r="2" fill="#FFFFFF" />

                {/* Beak */}
                <ellipse cx="100" cy="85" rx="8" ry="6" fill="#E0534E" />

                {/* Feet */}
                <ellipse cx="80" cy="210" rx="18" ry="12" fill="#E0534E" />
                <ellipse cx="120" cy="210" rx="18" ry="12" fill="#E0534E" />

                {/* Wings */}
                <ellipse
                  cx="50"
                  cy="140"
                  rx="20"
                  ry="45"
                  fill="#2C3E50"
                  transform="rotate(-20 50 140)"
                />
                <ellipse
                  cx="150"
                  cy="140"
                  rx="20"
                  ry="45"
                  fill="#2C3E50"
                  transform="rotate(20 150 140)"
                />

                {/* Flashlight */}
                <rect
                  x="145"
                  y="170"
                  width="8"
                  height="20"
                  fill="#9AA4AF"
                  rx="2"
                />
                <rect
                  x="143"
                  y="165"
                  width="12"
                  height="8"
                  fill="#9AA4AF"
                  rx="1"
                />
                <polygon
                  points="149,165 144,155 154,155"
                  fill="#6EE7F9"
                  opacity="0.6"
                  className="flashlight-beam"
                />
              </svg>

              {/* Floating chips */}
              <svg
                className="chip chip-1"
                viewBox="0 0 40 50"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20,5 L35,45 L5,45 Z"
                  fill="#E0534E"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="15"
                  x2="20"
                  y2="40"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="15"
                  y1="25"
                  x2="25"
                  y2="25"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="12"
                  y1="35"
                  x2="28"
                  y2="35"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>

              <svg
                className="chip chip-2"
                viewBox="0 0 40 50"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20,5 L35,45 L5,45 Z"
                  fill="#6EE7F9"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="15"
                  x2="20"
                  y2="40"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="15"
                  y1="25"
                  x2="25"
                  y2="25"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="12"
                  y1="35"
                  x2="28"
                  y2="35"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>

              <svg
                className="chip chip-3"
                viewBox="0 0 40 50"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20,5 L35,45 L5,45 Z"
                  fill="#E0534E"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="15"
                  x2="20"
                  y2="40"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="15"
                  y1="25"
                  x2="25"
                  y2="25"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="12"
                  y1="35"
                  x2="28"
                  y2="35"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </div>

            <div className="content-wrapper">
              <div className="error-code" aria-hidden="true">
                404
              </div>
              <h1 className="error-title">길을 잃었군요</h1>
              <p className="error-subtitle">여기는 막다른 길이에요</p>

              <div className="action-buttons">
                <Link to="/" className="btn btn-primary">
                  홈으로 가기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
