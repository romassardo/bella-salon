import { Nav } from '@/components/salon/Nav';
import { Hero } from '@/components/salon/Hero';
import { Marquee } from '@/components/salon/Marquee';
import { About } from '@/components/salon/About';
import { Catalog } from '@/components/salon/Catalog';
import { Assistant } from '@/components/salon/Assistant';
import { Booking } from '@/components/salon/Booking';
import { Footer } from '@/components/salon/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Catalog />
      <Assistant />
      <Booking />
      <Footer />
    </>
  );
}
