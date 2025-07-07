import '../styles/board.css'
import MiniBoard from './miniBoard';
function Board() {

    const boardData = [
    {
        boardTitle: 'A 게시판',
        title: 'A게시판 인기글 제목입니다',
        createdAt: '2025-07-07',
        view: 120,
        link: '/board/a/1',
        author: '김개발',
    },
    {
        boardTitle: 'B 게시판',
        title: 'B게시판의 흥미로운 글',
        createdAt: '2025-07-06',
        view: 98,
        link: '/board/b/5',
        author: '이나은',
    },
    {
        boardTitle: 'C 게시판',
        title: 'C게시판 최신 정보 공유',
        createdAt: '2025-07-07',
        view: 250,
        link: '/board/c/12',
        author: '박코딩',
    },
    {
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
                {boardData.map((board) => (
                    // key는 React가 각 요소를 구분하기 위한 필수 값
                    // {...board}는 board 객체의 모든 속성을 props로 한 번에 전달
                    <MiniBoard key={board.boardTitle} {...board} />
                ))}
            </div>
        </div>
    )
}

export default Board;