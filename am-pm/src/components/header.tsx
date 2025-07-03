import '../styles/header.css'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import User from './User';

export const fakeUser = {
  studentId: '202010957',
  name: '한준서',
  rank: 'gold',
};

function Header() {
    const location = useLocation();
    return (
        <header className='header'>
            <div className='container'>
                {/* 로고 */}
                <div className='logo'></div>
                {/* 네비바 */}
                <nav className='nav'>
                    <ul className='nav-list'>
                        <li className={`nav-item${location.pathname === '/' ? ' nav-item-current' : ''}`}><NavLink to='/' end>홈 </NavLink></li>
                        <li className={`nav-item${location.pathname === '/projects' ? ' nav-item-current' : ''}`}><NavLink to='/projects'>프로젝트 자랑</NavLink></li>
                        <li className={`nav-item${location.pathname === '/rank' ? ' nav-item-current' : ''}`}><NavLink to='/rank'>백준 랭크</NavLink></li>
                    </ul>
                </nav>
                {/* 유저 정보 */}
                <div className='user'>
                    <User name={fakeUser.name} rank={fakeUser.rank} />
                </div>
            </div>
        </header>
    )
}

export default Header