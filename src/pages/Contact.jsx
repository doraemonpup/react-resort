import { useEffect, useRef, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import Hero from '../components/Hero.jsx';
import Banner from '../components/Banner.jsx';
import { Link } from 'react-router';

const EMPTY_FORM = { name: '', email: '', title: '', message: '' };

// Demo only: nothing is sent anywhere. The button unlocks once every field
// is filled and the email looks plausible, then the form swaps for a receipt.
const Contact = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (sent) receiptRef.current?.focus();
  }, [sent]);

  const handleChange = event =>
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const filled = Object.values(form).every(value => value.trim().length > 0);
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const canSend = filled && emailLooksValid;

  const handleSubmit = event => {
    event.preventDefault();
    if (!canSend) return;
    setSent(true);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setSent(false);
  };

  return (
    <>
      <Hero hero='contactHero'>
        <Banner
          title='Contact Us'
          subtitle='Questions about a stay, an event, or the island?'
        />
      </Hero>
      <section className='contact'>
        {sent ? (
          <div className='contact-card contact-receipt' role='status'>
            <span className='contact-receipt-mark' aria-hidden='true'>
              ✓
            </span>
            <h3 tabIndex='-1' ref={receiptRef}>
              Thanks, we'll reply within 24 hours.
            </h3>
            <p>
              Your message is with our front desk. If it's urgent, call us on
              +351 210 000 000.
            </p>
            <button type='button' className='btn-primary' onClick={handleReset}>
              Send another message
            </button>
          </div>
        ) : (
          <div className='contact-card'>
            <header className='contact-head'>
              <h3>Send us a message</h3>
              <p>All fields are required.</p>
              <p className='demo-note'>
                <FaInfoCircle aria-hidden='true' />
                <span>Demo only - nothing is actually sent or stored.</span>
              </p>
            </header>
            <form className='contact-form' onSubmit={handleSubmit} noValidate>
              <div className='form-group'>
                <label htmlFor='contact-name'>name</label>
                <input
                  id='contact-name'
                  name='name'
                  className='form-control'
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='contact-email'>email</label>
                <input
                  id='contact-email'
                  name='email'
                  type='email'
                  className='form-control'
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='contact-title'>title</label>
                <input
                  id='contact-title'
                  name='title'
                  className='form-control'
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='contact-message'>message</label>
                <textarea
                  id='contact-message'
                  name='message'
                  className='form-control contact-message'
                  rows='6'
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
              <button
                type='submit'
                className='btn-primary contact-submit'
                disabled={!canSend}
              >
                Send message
              </button>
            </form>
          </div>
        )}
        <p className='contact-back'>
          <Link to='/'>Back to home</Link>
        </p>
      </section>
    </>
  );
};

export default Contact;
