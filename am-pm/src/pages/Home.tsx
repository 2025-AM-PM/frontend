import React from 'react';
import Header from '../components/header'
import '../styles/home.css'
import Board from '../components/board';
import {Clock} from "../components/clock"

function HomePage() {
  return (
    <div className='main'>
        <Header />
        <Clock initialSeconds={3186254}/>
        <Board />
    </div>
  )
}

export default HomePage;