import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router';
import { RoomContext } from '../context.jsx';
import { Link } from 'react-router';
import {
  FaBath,
  FaBed,
  FaCheck,
  FaLeaf,
  FaMugHot,
  FaPaw,
  FaShieldAlt,
  FaWifi,
  FaWineGlassAlt,
} from 'react-icons/fa';
import Banner from '../components/Banner.jsx';
import StyledHero from '../components/StyledHero.js';
import AvailabilityForm from '../components/AvailabilityForm.jsx';
import defaultBcg from '../images/room-1.jpeg';
import Error from './Error.jsx';

// Keyword match so the icon still fits if the copy in data.js changes.
const EXTRA_ICONS = [
  { pattern: /pillow|linen|bed/i, icon: <FaBed /> },
  { pattern: /towel|bath/i, icon: <FaBath /> },
  { pattern: /toiletr|soap|shampoo/i, icon: <FaLeaf /> },
  { pattern: /refresh|drink|coffee|bar/i, icon: <FaWineGlassAlt /> },
  { pattern: /safety|security/i, icon: <FaShieldAlt /> },
  { pattern: /internet|wi-?fi/i, icon: <FaWifi /> },
];

const iconFor = text =>
  EXTRA_ICONS.find(({ pattern }) => pattern.test(text))?.icon ?? <FaCheck />;

const SingleRoom = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const roomContext = useContext(RoomContext);
  const room = roomContext.getRoom(slug);

  if (!room) {
    // return (
    //   <div className='error'>
    //     <h3>no such room could be found...</h3>
    //     <Link to='/rooms' className='btn-primary'>
    //       back to rooms
    //     </Link>
    //   </div>
    // );
    return <Error />;
  }

  const {
    name,
    description,
    capacity,
    size,
    price,
    extras,
    breakfast,
    pets,
    images,
  } = room;
  const [mainImg, ...defaultImg] = images;

  return (
    <>
      <StyledHero img={mainImg || defaultBcg}>
        <Banner title={`${name} room`}>
          <Link to='/rooms' className='btn-primary'>
            back to rooms
          </Link>
        </Banner>
      </StyledHero>
      <section className='single-room'>
        <div className='single-room-images'>
          {defaultImg.map((item, index) => {
            return <img key={index} src={item} alt={name} />;
          })}
        </div>
        <div className='single-room-info'>
          <article className='desc'>
            <h3>details</h3>
            <p>{description}</p>
          </article>
          <article className='info'>
            <h3>info</h3>
            <h6>price : {price}€</h6>
            <h6>size : {size} SQFT</h6>
            <h6>
              max capacity :{' '}
              {capacity > 1 ? `${capacity} people` : `${capacity} person`}
            </h6>
          </article>
        </div>
      </section>
      <section className='room-extras'>
        <div className='room-extras-card'>
          <header className='room-extras-head'>
            <h3>What's included</h3>
            <div className='room-extras-flags'>
              {breakfast && (
                <span>
                  <FaMugHot aria-hidden='true' />
                  Free breakfast
                </span>
              )}
              {pets && (
                <span>
                  <FaPaw aria-hidden='true' />
                  Pets welcome
                </span>
              )}
            </div>
          </header>
          <ul className='extras'>
            {extras.map(item => {
              return (
                <li key={item}>
                  <span className='extra-icon' aria-hidden='true'>
                    {iconFor(item)}
                  </span>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className='room-booking'>
        <AvailabilityForm
          variant='panel'
          title='Reserve this room'
          maxGuests={capacity}
          nightlyRate={price}
          onSubmit={({ checkIn, checkOut, guests }) =>
            navigate(
              `/book/${slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
            )
          }
        />
      </section>
    </>
  );
};

export default SingleRoom;
