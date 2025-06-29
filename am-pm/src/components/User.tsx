import '../styles/user.css';
import { Link } from 'react-router-dom';

function User({ name, rank }: { name: string; rank: string }) {

  let rankImgSrc = '';
  try {
    rankImgSrc = require(`../assets/${rank}.png`);
  } catch (e) {
    rankImgSrc = '';
  }
  
  return (
    <div className='user'>
        {rankImgSrc && <img src={rankImgSrc} alt={rank} className="tier" />}
        <span className='user-name'>{name}</span>
        <Link to="./login">로그아웃</Link>
    </div>
  )
}

export default User;