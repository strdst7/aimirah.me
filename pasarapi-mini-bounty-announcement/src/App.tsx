import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { FuelSection } from './components/FuelSection';
import { ForexSection } from './components/ForexSection';
import { PopulationSection } from './components/PopulationSection';
import { BirthsSection } from './components/BirthsSection';
import { IncomeSection } from './components/IncomeSection';
import { DirectorySection } from './components/DirectorySection';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-ink font-sans">
      <Header />
      <main>
        <Hero />
        <Ticker />
        <FuelSection />
        <ForexSection />
        <PopulationSection />
        <BirthsSection />
        <IncomeSection />
        <DirectorySection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
