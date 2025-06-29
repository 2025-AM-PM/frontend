import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/Home';
import Project from './components/project';
import './App.css';
import Rank from './components/rank';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/projects' element={<Project />} />
      <Route path='/rank' element={<Rank />} />
    </Routes>
  );
}

export default App;
