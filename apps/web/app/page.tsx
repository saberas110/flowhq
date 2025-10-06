import { CTASection, FeaturesSection, HeroSection, TestimonialsSection } from '@/components/landing';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
