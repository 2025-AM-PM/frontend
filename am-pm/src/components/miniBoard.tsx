import '../styles/miniBoard.css'
import { MiniBoardProps } from '../types'

const MiniBoard: React.FC<MiniBoardProps> = ({ boardTitle, title, createdAt, view, link, author }) => {
    return (
        <div className='mb-container'>
            <h3>{boardTitle}</h3>
            <a href={link} className="post-title">{title}</a>
            <div className="post-info">
                <span>작성자: {author}</span>
                <span>조회수: {view}</span>
                <span>{createdAt}</span>
            </div>
        </div>
    );
}

export default MiniBoard;