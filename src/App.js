import React from 'react';
import './App.scss';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import SingleRoom from './pages/SingleRoom';
import Error from './pages/Error';
import Navbar from './components/Navbar';
import About from './pages/About';

import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} exact />
        <Route path='/rooms/' element={<Rooms />} exact />
        <Route path='/rooms/:slug' element={<SingleRoom />} exact />
        <Route path='/about' element={<About />} exact />
        <Route path='*' element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
