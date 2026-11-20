import './App.scss';
import Home from './pages/Home.jsx';
import Rooms from './pages/Rooms.jsx';
import SingleRoom from './pages/SingleRoom.jsx';
import Error from './pages/Error.jsx';
import Navbar from './components/Navbar.jsx';
import About from './pages/About.jsx';
import Book from './pages/Book.jsx';

import { Routes, Route } from 'react-router';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} exact />
        <Route path='/rooms/' element={<Rooms />} exact />
        <Route path='/rooms/:slug' element={<SingleRoom />} exact />
        <Route path='/about' element={<About />} exact />
        <Route path='/book' element={<Book />} exact />
        <Route path='*' element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
