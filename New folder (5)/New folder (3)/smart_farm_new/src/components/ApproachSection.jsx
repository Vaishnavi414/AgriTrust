import approachBg from "@/assets/approach-bg.jpg";
import { motion } from "framer-motion";
import { slideLeft } from "@/utils/animations";
import AnimatedHeading from "@/components/AnimatedHeading";

const ApproachSection = () => {
  return (
    <section className="relative py-48 overflow-hidden min-h-[600px]">
      <motion.div initial={{ opacity: 0, scale: 1.1 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} viewport={{ once: true }} className="absolute inset-0">
        <img src={approachBg} alt="Mountain farm landscape" loading="lazy" width={1920} height={1200} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-farm-dark/70 via-farm-dark/40 to-transparent" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-lg">
          <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-heading text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight heading-tight">
            <AnimatedHeading text="Our Approach" delay={0.1} />
          </motion.h2>
          <motion.p variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-primary-foreground/80 text-lg leading-relaxed font-body body-relaxed">
            We connect farmers directly with buyers through our innovative marketplace platform. Using real-time bidding, weather insights, and project management tools, we create a seamless farm-to-table experience for everyone.
          </motion.p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
          <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </motion.div>
    </section>
  );
};

export default ApproachSection;