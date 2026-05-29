import footerFarm from "@/assets/footer-farm.jpg";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { slideLeft, slideRight } from "@/utils/animations";
import { MagneticButton } from "@/components/MagneticButton";
import AnimatedHeading from "@/components/AnimatedHeading";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const [emailFocused, setEmailFocused] = useState(false);

  return (
    <section className="cta-section relative py-32 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute inset-0"
      >
        <img
          src={footerFarm}
          alt="Countryside farm at dusk"
          loading="lazy"
          width={1920}
          height={600}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-farm-dark/80 via-farm-dark/50 to-farm-dark/30" />
      </motion.div>

      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="absolute top-0 left-0 right-0"
      >
        <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
          <path d="M0,0 L0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,0 Z" fill="hsl(var(--muted) / 0.5)" />
        </svg>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2
              className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground leading-tight heading-tight"
              animate={{ textShadow: ["0 0 0px rgba(34, 197, 94, 0)", "0 0 25px rgba(34, 197, 94, 0.4)", "0 0 0px rgba(34, 197, 94, 0)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <AnimatedHeading text="Ready to Transform Your Farm?" />
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-primary-foreground/80 mt-4 mb-8">
               Join thousands of farmers and buyers already using Agri Trust to revolutionize agriculture.
            </motion.p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-6 text-lg rounded-full shadow-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg">
                  Learn More
                </Button>
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
            <motion.div className="relative bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-primary-foreground/70">Email Address</label>
                  <input type="email" placeholder="farmer@smartfarm.com" className="w-full mt-2 px-4 py-3 bg-background/50 border border-primary-foreground/20 rounded-lg text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-foreground/70">I'm interested in...</label>
                  <select className="w-full mt-2 px-4 py-3 bg-background/50 border border-primary-foreground/20 rounded-lg text-primary-foreground focus:outline-none focus:border-primary-foreground/50">
                    <option>Buying fresh produce</option>
                    <option>Selling my crops</option>
                    <option>Both</option>
                  </select>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg">
                  Join Waitlist
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;