import React, { useContext } from 'react';
import { RoomContext } from '../context.jsx';
import Loading from './Loading.jsx';
import Room from './Room.jsx';
import Title from './Title.jsx';

const FeaturedRooms = () => {
  const roomContext = useContext(RoomContext);
  let { loading, featuredRooms: rooms } = roomContext;
  rooms = rooms.map(room => {
    return <Room key={room.id} room={room} />;
  });

  return (
    <section className='featured-rooms'>
      <Title title='featured rooms' />
      <div className='featured-rooms-center'>
        {loading ? <Loading /> : rooms}
      </div>
    </section>
  );
};

export default FeaturedRooms;
