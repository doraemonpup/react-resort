const Hero = ({ children, hero = 'defaultHero' }) => {
  return <header className={hero}>{children}</header>;
};

Hero.defaultProps = {
  hero: 'defaultHero',
};

export default Hero;
