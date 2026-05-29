import heroFarm from "@/assets/hero-farm.jpg";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/MagneticButton";
import { fadeUp } from "@/utils/animations";
import AnimatedHeading from "@/components/AnimatedHeading";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden spatial-section">
      <motion.div
        className="absolute inset-0 spatial-bg"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <img
          src={heroFarm}
          alt="Beautiful farm landscape"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-farm-dark/40 via-farm-dark/20 to-farm-dark/60" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 heading-tight"
          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        >
          <AnimatedHeading text="Harvesting Sunshine," delay={0.2} />
          <br />
          <motion.span
            className="italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-r from-green-200 via-green-400 to-green-200 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient"
            >
              Growing Goodness
            </motion.span>
          </motion.span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto font-body body-relaxed"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
        >
          Your premier farming marketplace. Connect directly with local farmers,
          bid on fresh produce, and bring the farm to your table.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.6 }}
        >
          <a href="/home">
            <MagneticButton className="inline-block">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Started
              </Button>
            </MagneticButton>
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-0 left-0 right-0"
      >
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;