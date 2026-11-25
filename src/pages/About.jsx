import Hero from '../components/Hero.jsx';
import Banner from '../components/Banner.jsx';
import Title from '../components/Title.jsx';
import { Link } from 'react-router';
import { FaConciergeBell, FaLeaf, FaUmbrellaBeach } from 'react-icons/fa';
import storyImage from '../images/details-1.jpeg';

const values = [
  {
    icon: <FaLeaf />,
    title: 'low-impact by design',
    info: 'Solar water heating, refillable amenities, and a kitchen that buys from the market two villages over.',
  },
  {
    icon: <FaUmbrellaBeach />,
    title: 'everything within reach',
    info: 'The sand is forty metres away, breakfast runs until eleven, and nothing is more than a five-minute walk.',
  },
  {
    icon: <FaConciergeBell />,
    title: 'looked after, not managed',
    info: 'No queues and no scripts. Someone who knows your name answers the phone, day or night.',
  },
];

const About = () => {
  return (
    <>
      <Hero hero='aboutHero'>
        <Banner
          title='About Us'
          subtitle='A family-run retreat on the quiet side of the island.
            Thirteen rooms, one long stretch of sand, and nowhere else to be.'
        >
          <Link to='/book' className='btn-primary'>
            plan your stay
          </Link>
        </Banner>
      </Hero>

      <section className='about-story'>
        <div className='about-story-inner'>
          <figure className='about-story-media'>
            <img
              src={storyImage}
              alt='The long dining table in the resort kitchen, looking out to the pool'
            />
          </figure>
          <article className='about-story-copy'>
            <p className='about-eyebrow'>our story</p>
            <h2>A house that grew into a hideaway</h2>
            <div className='about-rule' />
            <p>
              The resort began as a single whitewashed house on the dunes,
              built by Inês and Tomás Mendes in 1998 as a place their friends
              would never want to leave. It still works that way - same family,
              same kitchen, same path through the palms to the water.
            </p>
            <p>
              Rooms were added slowly over the years, one at a time, each
              finished in lime plaster, oak and linen. There are thirteen now,
              never more, and the garden has had thirty years to grow around
              them.
            </p>
            <p className='about-signature'>Inês &amp; Tomás Mendes</p>
          </article>
        </div>
      </section>

      <section className='about-stats'>
        <dl className='about-stats-inner'>
          <div>
            <dt>family-run since</dt>
            <dd>1998</dd>
          </div>
          <div>
            <dt>rooms &amp; suites</dt>
            <dd>13</dd>
          </div>
          <div>
            <dt>to the sand</dt>
            <dd>40 m</dd>
          </div>
        </dl>
      </section>

      <section className='about-values'>
        <Title title='what we believe' />
        <div className='about-values-grid'>
          {values.map(value => (
            <article key={value.title} className='about-value'>
              <span aria-hidden='true'>{value.icon}</span>
              <h6>{value.title}</h6>
              <p>{value.info}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='about-close'>
        <h2>Come and see for yourself</h2>
        <div className='about-rule' />
        <p>
          September and October are the quiet months - warm water, an empty
          beach, and better rates than the summer.
        </p>
        <div className='about-close-actions'>
          <Link to='/book' className='btn-primary'>
            book your stay
          </Link>
          <Link to='/rooms' className='about-close-link'>
            browse rooms
          </Link>
        </div>
      </section>
    </>
  );
};

export default About;
