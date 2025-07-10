import React from 'react';
import Header from '../components/header'
import '../styles/home.css'
import Board from '../components/board';

function HomePage() {
  return (
    <div className='main'>
        <Header />
        <Board />
    </div>
  )
}

export default HomePage;