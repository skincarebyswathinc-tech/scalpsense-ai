import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import BeforeAfter from "@/components/landing/BeforeAfter";
import WhyScalpHealth from "@/components/landing/WhyScalpHealth";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import EmailCapture from "@/components/landing/EmailCapture";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
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
