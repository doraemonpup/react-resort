import Hero from '../components/Hero.jsx';
import Banner from '../components/Banner.jsx';
import { Link } from 'react-router';
import RoomContainer from '../components/RoomContainer.jsx';

const Rooms = () => {
  return (
    <>
      <Hero hero='roomsHero'>
        <Banner title='our rooms'>
          <Link to='/' className='btn-primary'>
            return home
          </Link>
        </Banner>
      </Hero>
      <RoomContainer />
    </>
  );
};

export default Rooms;
