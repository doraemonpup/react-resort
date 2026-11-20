import { useContext, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { RoomContext } from '../context';
import AvailabilityForm from '../components/AvailabilityForm';
import Error from './Error';
import {
  generateReference,
  isRoomAvailable,
  nightsBetween,
  saveBooking,
  toDateKey,
} from '../bookingStore';

const BookRoom = () => {
  const { slug } = useParams();
  const roomContext = useContext(RoomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const room = roomContext.getRoom(slug);
  const todayKey = toDateKey(new Date());

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests'), 10);
  const nights = nightsBetween(checkIn, checkOut);

  const available =
    room &&
    checkIn &&
    checkOut &&
    nights > 0 &&
    checkIn >= todayKey &&
    Number.isInteger(guests) &&
    guests >= 1 &&
    room.capacity >= guests &&
    isRoomAvailable(slug, checkIn, checkOut);

  if (!room) {
    return <Error />;
  }

  const handleReselect = search => {
    setSearchParams({
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: String(search.guests),
    });
  };

  const handleConfirm = event => {
    event.preventDefault();
    const ref = generateReference();
    saveBooking({
      ref,
      roomSlug: room.slug,
      roomName: room.name,
      checkIn,
      checkOut,
      guests,
      nights,
      totalPrice: nights * room.price,
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    });
    navigate(`/booking/${ref}`);
  };

  return (
    <section className='book-room'>
      <div className='section-title'>
        <h4>{room.name}</h4>
        <div />
      </div>
      {available ? (
        <div className='book-room-grid'>
          <div className='book-room-summary'>
            <img src={room.images[0]} alt={room.name} />
            <dl>
              <div>
                <dt>dates</dt>
                <dd>
                  {checkIn} → {checkOut}
                </dd>
              </div>
              <div>
                <dt>stay</dt>
                <dd>
                  {nights} nights, {guests}{' '}
                  {guests > 1 ? 'guests' : 'guest'}
                </dd>
              </div>
              <div>
                <dt>total</dt>
                <dd>{nights * room.price}€</dd>
              </div>
            </dl>
          </div>
          <form className='guest-form' onSubmit={handleConfirm}>
            <div className='form-group'>
              <label htmlFor='guest-name'>name</label>
              <input
                id='guest-name'
                className='form-control'
                value={name}
                required
                onChange={event => setName(event.target.value)}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='guest-email'>email</label>
              <input
                id='guest-email'
                type='email'
                className='form-control'
                value={email}
                required
                onChange={event => setEmail(event.target.value)}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='guest-phone'>phone (optional)</label>
              <input
                id='guest-phone'
                type='tel'
                className='form-control'
                value={phone}
                onChange={event => setPhone(event.target.value)}
              />
            </div>
            <button type='submit' className='btn-primary'>
              Confirm booking
            </button>
          </form>
        </div>
      ) : (
        <div className='book-room-reselect'>
          <p className='book-room-message'>
            Those dates are no longer available.
          </p>
          <AvailabilityForm variant='panel' onSubmit={handleReselect} />
        </div>
      )}
    </section>
  );
};

export default BookRoom;
