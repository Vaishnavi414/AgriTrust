import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ApproachSection from "@/components/ApproachSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProductShowcase from "@/components/ProductShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div 
      className="min-h-screen bg-background overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Navbar />
      <motion.div id="hero-section" variants={sectionVariants}>
        <HeroSection />
      </motion.div>
      <motion.div id="approach-section" variants={sectionVariants}>
        <ApproachSection />
      </motion.div>
      <motion.div id="features-section" variants={sectionVariants}>
        <FeaturesSection />
      </motion.div>
      <motion.div id="products-section" variants={sectionVariants}>
        <ProductShowcase />
      </motion.div>
      <motion.div id="footer-section" variants={sectionVariants}>
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default Index;