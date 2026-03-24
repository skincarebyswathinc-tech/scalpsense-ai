import Navbar from "@/components/landing/Navbar";
import UrgencyBanner from "@/components/landing/UrgencyBanner";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import SocialProofStats from "@/components/landing/SocialProofStats";
import BeforeAfter from "@/components/landing/BeforeAfter";
import WhyScalpHealth from "@/components/landing/WhyScalpHealth";
import Testimonials from "@/components/landing/Testimonials";
import EmailCapture from "@/components/landing/EmailCapture";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <UrgencyBanner />
      <Navbar />
      <HeroSection />
      <SocialProofStats />
      <HowItWorks />
      <BeforeAfter />
      <WhyScalpHealth />
      <Testimonials />
      <EmailCapture />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
