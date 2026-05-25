import BukuLatihanSection from "./sections/bukuLatihan";
import HeroSection from "./sections/hero";
import JoinUsSection from "./sections/joinUs";
import MascaCareSection from "./sections/mascaCare";

export default function Home() {
  return (
   <main>
      <HeroSection />
      <MascaCareSection />
      <BukuLatihanSection />
      <JoinUsSection />
    </main>
  );
}