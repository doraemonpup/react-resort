import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router';
import { RoomContext } from '../context.jsx';
import { Link } from 'react-router';
import Banner from '../components/Banner.jsx';
import StyledHero from '../components/StyledHero';
import AvailabilityForm from '../components/AvailabilityForm.jsx';
import defaultBcg from '../images/room-1.jpeg';
import Error from './Error.jsx';

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
            <h6>{pets ? 'pets allowed' : 'no pets allowed'}</h6>
            <h6>{breakfast && 'free breakfast included'}</h6>
          </article>
        </div>
      </section>
      <section className='room-extras'>
        <h6>extras</h6>
        <ul className='extras'>
          {extras.map((item, index) => {
            return <li key={index}>- {item}</li>;
          })}
        </ul>
      </section>
      <section className='room-booking'>
        <div className='section-title'>
          <h4>book this room</h4>
          <div />
        </div>
        <AvailabilityForm
          variant='panel'
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
