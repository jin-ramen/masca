import BukuLatihanSection from "./sections/bukuLatihan";
import HeroSection from "./sections/hero";
import JoinUsSection from "./sections/joinUs";

export default function Home() {
  return (
   <main>
      <HeroSection />
      <BukuLatihanSection />
      <JoinUsSection />
    </main>
  );
}