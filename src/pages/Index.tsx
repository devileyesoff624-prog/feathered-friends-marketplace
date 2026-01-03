import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedBirds from "@/components/FeaturedBirds";
import FeaturesSection from "@/components/FeaturesSection";
import SellerCTA from "@/components/SellerCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid />
        <FeaturedBirds />
        <FeaturesSection />
        <SellerCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
