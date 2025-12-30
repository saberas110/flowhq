import { CTASection, FeaturesSection, HeroSection, TestimonialsSection } from '@/components/landing';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function Index() {


  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
