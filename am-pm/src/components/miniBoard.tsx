// src/components/miniBoard.tsx
import "../styles/miniBoard.css";
import { MiniBoardProps } from "../types"; // Post 타입도 가져옵니다.
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function formatTimeWithLibrary(dateString: string) {
  const postDate = new Date(dateString);
  return formatDistanceToNow(postDate, {
    addSuffix: true,
    locale: ko,
  });
}

const MiniBoard: React.FC<MiniBoardProps> = ({ boardTitle, posts }) => {
  // posts 배열을 props로 받습니다.
  const navigate = useNavigate();

  // 클릭 시 해당 게시물의 링크로 이동하는 함수
  const handleRowClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="mb-container">
      <h3 className="mb-title">{boardTitle}</h3>
      <table className="post-table">
        <thead>
          <tr>
            <th className="th-title">제목</th>
            <th className="th-author">작성자</th>
            <th className="th-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          {/* posts 배열을 map()으로 순회하며 각 post에 대한 <tr>을 생성합니다. */}
          {posts.map((post) => (
            <tr
              key={post.id} // 리액트가 각 항목을 구분하기 위한 고유한 key
              className="clickable-row"
              onClick={() => handleRowClick(post.link)}
            >
              <td className="td-title">
                {/* a 태그는 의미상 유지하되, 클릭 이벤트는 tr이 담당합니다. */}
                <a href={post.link} onClick={(e) => e.preventDefault()}>
                  {post.title}
                </a>
              </td>
              <td className="td-author">{post.author}</td>
              <td className="td-date">
                {formatTimeWithLibrary(post.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MiniBoard;
