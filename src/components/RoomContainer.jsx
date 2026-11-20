import RoomFilter from './RoomFilter.jsx';
import RoomList from './RoomList.jsx';
import { withRoomConsumer } from '../context.jsx';
import Loading from './Loading.jsx';

const RoomContainer = ({ context }) => {
  const { loading, sortedRooms, rooms } = context;

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <RoomFilter rooms={rooms} />
      <RoomList rooms={sortedRooms} />
    </>
  );
};

export default withRoomConsumer(RoomContainer);
