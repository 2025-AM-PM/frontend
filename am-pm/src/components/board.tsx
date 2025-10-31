import "../styles/board.css";
import MiniBoard from "./miniBoard";
import { Post } from "../types";

function Board() {
  const boardData = {
    studyBoards: [
      {
        id: 1,
        title: "A게시판 인기글 제목입니다",
        writter: "김개발",
        createdAt: "2025-07-07T00:00:00",
        commentCount: 12,
        view: 10,
        link: "/data/a",
      },
      {
        id: 4,
        title: "A게시판 질문 있어요",
        writter: "준서",
        createdAt: "2025-07-05T00:00:00",
        commentCount: 7,
        view: 14,
        link: "/data/a",
      },
    ],
    jobBoards: [
      {
        id: 2,
        title: "B게시판의 흥미로운 글",
        writter: "이나은",
        createdAt: "2025-07-06T00:00:00",
        commentCount: 9,
        view: 10,
        link: "/data/b",
      },
    ],
    exhibits: [
      {
        id: 3,
        title: "C게시판 최신 정보 공유",
        writter: "박코딩",
        createdAt: "2025-07-07T00:00:00",
        view: 40,
        link: "/data/c",
      },
    ],
    notices: [
      {
        id: 4,
        title: "D게시판 질문 있어요",
        writter: "관리자",
        createdAt: "2025-07-05T00:00:00",
        view: 50,
        link: "/data/d",
      },
    ],
  };

  const boardTitles = {
    studyBoards: "스터디",
    jobBoards: "취업 정보",
    exhibits: "학교 공지",
    notices: "공지사항",
  };

  return (
    <div className="board-main">
      <div className="board-container">
        {Object.entries(boardData).map(([key, posts]) => {
          // MiniBoard에 전달할 게시글 데이터 객체 생성
          const normalizepPost: Post[] = posts.map((post) => ({
            id: post.id,
            title: post.title,
            author: post.writter || "익명",
            createdAt: post.createdAt,
            view: post.view,
            link: post.link,
          }));

          // MiniBoard 컴포넌트를 렌더링하고 props를 전달
          return (
            <MiniBoard
              key={key} // key는 필수입니다.
              boardTitle={boardTitles[key as keyof typeof boardTitles]}
              posts={normalizepPost} // 게시글 데이터를 배열로 감싸서 전달
            />
          );
        })}
      </div>
    </div>
  );
}

export default Board;
