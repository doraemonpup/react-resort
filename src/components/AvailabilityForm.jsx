import { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { nightsBetween, toDateKey } from '../bookingStore';

const clampGuests = (value, max) =>
  Math.min(Math.max(Number(value) || 1, 1), Math.max(max, 1));

// Reusable stay search: dates + guests. Calls onSubmit only with valid data.
// variant: 'strip' (horizontal, home hero / book page) | 'panel' (card, room pages).
const AvailabilityForm = ({
  variant = 'panel',
  initial,
  maxGuests = 10,
  nightlyRate,
  title = 'Reserve this room',
  onSubmit,
}) => {
  const todayKey = toDateKey(new Date());
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? '');
  const [guests, setGuests] = useState(() =>
    clampGuests(initial?.guests ?? 1, maxGuests)
  );
  const [errors, setErrors] = useState([]);

  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? nightsBetween(checkIn, checkOut)
      : 0;

  const stepGuests = step =>
    setGuests(current => clampGuests(current + step, maxGuests));

  const handleSubmit = event => {
    event.preventDefault();
    const found = [];
    if (!checkIn || !checkOut) {
      found.push('Pick your check-in and check-out dates.');
    }
    if (checkIn && checkIn < todayKey) {
      found.push("Check-in can't be in the past");
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      found.push('Check-out must be after check-in');
    }
    if (guests > maxGuests) {
      found.push(`This room sleeps ${maxGuests}.`);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);
    onSubmit({ checkIn, checkOut, guests: Number(guests) });
  };

  return (
    <form
      className={`availability-form availability-form--${variant}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {variant === 'panel' && title && (
        <header className='availability-header'>
          <h4>{title}</h4>
          {nightlyRate > 0 && (
            <p className='availability-rate'>
              {nightlyRate}€ <span>per night</span>
            </p>
          )}
        </header>
      )}
      {errors.length > 0 && (
        <div className='availability-form-errors' role='alert'>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <div className='availability-dates'>
        <div className='form-group'>
          <label htmlFor={`check-in-${variant}`}>check-in</label>
          <input
            type='date'
            id={`check-in-${variant}`}
            className='form-control'
            value={checkIn}
            min={todayKey}
            aria-invalid={errors.length > 0}
            onChange={event => setCheckIn(event.target.value)}
          />
        </div>
        <div className='form-group'>
          <label htmlFor={`check-out-${variant}`}>check-out</label>
          <input
            type='date'
            id={`check-out-${variant}`}
            className='form-control'
            value={checkOut}
            min={checkIn || todayKey}
            aria-invalid={errors.length > 0}
            onChange={event => setCheckOut(event.target.value)}
          />
        </div>
      </div>
      <div className='form-group availability-guests'>
        <label htmlFor={`guests-${variant}`}>guests</label>
        <div className='guest-row'>
          <div className='guest-stepper'>
            <button
              type='button'
              aria-label='One fewer guest'
              onClick={() => stepGuests(-1)}
              disabled={guests <= 1}
            >
              <FaMinus />
            </button>
            <output
              id={`guests-${variant}`}
              aria-live='polite'
              aria-atomic='true'
            >
              {guests}
            </output>
            <button
              type='button'
              aria-label='One more guest'
              onClick={() => stepGuests(1)}
              disabled={guests >= maxGuests}
            >
              <FaPlus />
            </button>
          </div>
          <span className='availability-hint'>
            {maxGuests === 1 ? 'Sleeps 1' : `Sleeps ${maxGuests}`}
          </span>
        </div>
      </div>
      {nights > 0 && nightlyRate > 0 && (
        <dl className='availability-total'>
          <div>
            <dt>stay</dt>
            <dd>
              {nights} {nights === 1 ? 'night' : 'nights'} × {nightlyRate}€
            </dd>
          </div>
          <div>
            <dt>total</dt>
            <dd>{nights * nightlyRate}€</dd>
          </div>
        </dl>
      )}
      <button type='submit' className='btn-primary'>
        Check availability
      </button>
    </form>
  );
};

export default AvailabilityForm;
