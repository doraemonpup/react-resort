import { useContext } from 'react';
import { Link, useSearchParams } from 'react-router';
import { RoomContext } from '../context';
import AvailabilityForm from '../components/AvailabilityForm';
import { isRoomAvailable, nightsBetween } from '../bookingStore';

const Book = () => {
  const roomContext = useContext(RoomContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests'), 10);

  const nights = nightsBetween(checkIn, checkOut);
  const valid =
    checkIn && checkOut && nights > 0 && Number.isInteger(guests) && guests >= 1;

  const available = valid
    ? roomContext.rooms.filter(
        room =>
          room.capacity >= guests && isRoomAvailable(room.slug, checkIn, checkOut)
      )
    : [];

  return (
    <>
      <section className='book-search'>
        <div className='section-title'>
          <h4>book your stay</h4>
          <div />
        </div>
        <AvailabilityForm
          variant='strip'
          initial={
            valid ? { checkIn, checkOut, guests } : undefined
          }
          onSubmit={search => {
            const next = new URLSearchParams(searchParams);
            next.set('checkIn', search.checkIn);
            next.set('checkOut', search.checkOut);
            next.set('guests', String(search.guests));
            setSearchParams(next);
          }}
        />
      </section>
      {valid ? (
        available.length > 0 ? (
          <section className='book-results'>
            <div className='book-results-center'>
              {available.map(room => {
                const total = nights * room.price;
                return (
                  <article key={room.id} className='book-result'>
                    <img src={room.images[0]} alt={room.name} />
                    <div className='book-result-info'>
                      <h4>{room.name}</h4>
                      <p>sleeps {room.capacity}</p>
                      <h5>
                        {total}€ for {nights} nights
                      </h5>
                      <Link
                        to={`/book/${room.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                        className='btn-primary'
                      >
                        Book this room
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <div className='empty-search'>
            <h3>No rooms match those dates. Try shifting your stay.</h3>
          </div>
        )
      ) : (
        <div className='empty-search'>
          <h3>Pick your dates to see available rooms.</h3>
        </div>
      )}
    </>
  );
};

export default Book;
