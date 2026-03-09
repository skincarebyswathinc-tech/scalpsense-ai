import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
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
      <WhyScalpHealth />
      <Testimonials />
      <FAQ />
      <EmailCapture />
      <Footer />
    </div>
  );
};

export default Index;
