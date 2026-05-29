import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerItem } from "@/utils/animations";
import AnimatedHeading from "@/components/AnimatedHeading";
import { SpatialCard } from "./spatial/SpatialCard";

const testimonials = [
   { name: "Emily Smith", role: "Local Farmer", text: "Agri Trust transformed my small farm business.", avatar: "ES" },
  { name: "Sarah Brown", role: "Organic Buyer", text: "I love being able to browse fresh produce from local farmers.", avatar: "SB" },
  { name: "David Rodriguez", role: "Farm Cooperative Lead", text: "The project management tools have been invaluable.", avatar: "DR" },
];

const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.3);

  return (
    <section className="py-24 bg-muted/50 spatial-section relative" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 variants={fadeUp} initial="hidden" animate={isVisible ? "visible" : "hidden"} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 heading-tight">
            <AnimatedHeading text="Client Testimonials" delay={0.1} />
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" animate={isVisible ? "visible" : "hidden"} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl mx-auto body-relaxed">
            Hear from farmers and buyers who trust our marketplace.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto spatial-container">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.7, delay: i * 0.15, type: "spring", stiffness: 100 }}>
              <SpatialCard className="h-full group" depth={i * 15} rotationIntensity={6}>
                <div className="glass-vision-strong rounded-2xl p-8 h-full floating-3d relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary">{t.avatar}</div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{t.text}</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                </div>
              </SpatialCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;