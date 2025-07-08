import '../styles/board.css'
import MiniBoard from './miniBoard';
import { Post } from '../types';

function Board() {
    
    const boardData = [
    {
        id: 1,
        boardTitle: 'A 게시판',
        title: 'A게시판 인기글 제목입니다',
        createdAt: '2025-07-07',
        view: 120,
        link: '/board/a/1',
        author: '김개발',
    },
    {
        id: 2,
        boardTitle: 'B 게시판',
        title: 'B게시판의 흥미로운 글',
        createdAt: '2025-07-06',
        view: 98,
        link: '/board/b/5',
        author: '이나은',
    },
    {
        id:3,
        boardTitle: 'C 게시판',
        title: 'C게시판 최신 정보 공유',
        createdAt: '2025-07-07',
        view: 250,
        link: '/board/c/12',
        author: '박코딩',
    },
    {
        id:4,
        boardTitle: 'D 게시판',
        title: 'D게시판 질문 있어요',
        createdAt: '2025-07-05',
        view: 77,
        link: '/board/d/9',
        author: '최유저',
    },
    ];

    return (
        <div className='board-main'>
            <div className='board-container'>
                {boardData.map((board) => {
                    // MiniBoard에 전달할 게시글 데이터 객체 생성
                    const post: Post = {
                        id: board.id,
                        title: board.title,
                        author: board.author,
                        createdAt: board.createdAt,
                        view: board.view,
                        link: board.link
                    };

                    // MiniBoard 컴포넌트를 렌더링하고 props를 전달
                    return (
                        <MiniBoard
                            key={board.id} // key는 필수입니다.
                            boardTitle={board.boardTitle}
                            posts={[post]} // 게시글 데이터를 배열로 감싸서 전달
                        />
                    );
                })}
            </div>
        </div>
    )
}


export default Board;