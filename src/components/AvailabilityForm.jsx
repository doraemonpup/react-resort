import { useState } from 'react';
import { toDateKey } from '../bookingStore';

// Reusable stay search: dates + guests. Calls onSubmit only with valid data.
// variant: 'strip' (horizontal, home hero) | 'panel' (stacked, room pages).
const AvailabilityForm = ({ variant = 'panel', initial, onSubmit }) => {
  const todayKey = toDateKey(new Date());
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? '');
  const [guests, setGuests] = useState(initial?.guests ?? 1);
  const [errors, setErrors] = useState([]);

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
      {errors.length > 0 && (
        <div className='availability-form-errors' role='alert'>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <div className='form-group'>
        <label htmlFor={`check-in-${variant}`}>check-in</label>
        <input
          type='date'
          id={`check-in-${variant}`}
          className='form-control'
          value={checkIn}
          min={todayKey}
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
          onChange={event => setCheckOut(event.target.value)}
        />
      </div>
      <div className='form-group'>
        <label htmlFor={`guests-${variant}`}>guests</label>
        <input
          type='number'
          id={`guests-${variant}`}
          className='form-control'
          value={guests}
          min='1'
          onChange={event => setGuests(event.target.value)}
        />
      </div>
      <button type='submit' className='btn-primary'>
        Check availability
      </button>
    </form>
  );
};

export default AvailabilityForm;
