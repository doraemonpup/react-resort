import { Link, useParams } from 'react-router';
import { getBookingByRef } from '../bookingStore';

const BookingConfirmed = () => {
  const { ref } = useParams();
  const booking = getBookingByRef(ref);

  if (!booking) {
    return (
      <section className='booking-confirmed'>
        <div className='section-title'>
          <h4>Booking not found</h4>
          <div />
        </div>
        <p className='booking-missing'>We couldn't find that booking.</p>
        <Link to='/book' className='btn-primary'>
          Check availability
        </Link>
      </section>
    );
  }

  return (
    <section className='booking-confirmed'>
      <div className='section-title'>
        <h4>Your booking is confirmed</h4>
        <div />
      </div>
      <div className='booking-card'>
        <p className='booking-ref'>{booking.ref}</p>
        <dl>
          <div>
            <dt>room</dt>
            <dd>{booking.roomName}</dd>
          </div>
          <div>
            <dt>dates</dt>
            <dd>
              {booking.checkIn} → {booking.checkOut}
            </dd>
          </div>
          <div>
            <dt>stay</dt>
            <dd>
              {booking.nights} nights, {booking.guests}{' '}
              {booking.guests > 1 ? 'guests' : 'guest'}
            </dd>
          </div>
          <div>
            <dt>total</dt>
            <dd>{booking.totalPrice}€</dd>
          </div>
          <div>
            <dt>guest</dt>
            <dd>
              {booking.name}, {booking.email}
            </dd>
          </div>
        </dl>
      </div>
      <Link to='/' className='btn-primary'>
        Back to home
      </Link>
    </section>
  );
};

export default BookingConfirmed;
