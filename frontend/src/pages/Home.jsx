import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Offerings from '../components/Offerings';
import WhyChooseUs from '../components/WhyChooseUs';
import CtaSection from '../components/CtaSection';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Offerings />
      <WhyChooseUs />
      <CtaSection />
    </>
  );
}

