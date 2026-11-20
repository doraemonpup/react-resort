import { Link, useNavigate } from 'react-router';
import Hero from '../components/Hero.jsx';
import Banner from '../components/Banner.jsx';
import Services from '../components/Services.jsx';
import FeaturedRooms from '../components/FeaturedRooms.jsx';
import AvailabilityForm from '../components/AvailabilityForm.jsx';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero>
        <div className='home-cta'>
          <Banner
            title='luxurious rooms'
            subtitle='deluxe rooms starting at 299€'
          >
            <Link to='/rooms' className='btn-primary'>
              our rooms
            </Link>
          </Banner>
          <AvailabilityForm
            variant='strip'
            onSubmit={({ checkIn, checkOut, guests }) =>
              navigate(
                `/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
              )
            }
          />
        </div>
      </Hero>
      <Services />
      <FeaturedRooms />
    </>
  );
};

export default Home;
