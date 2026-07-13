import { Sprout, CloudSun, Leaf, MapPin } from "lucide-react";
import servicesBg from "@/assets/services-bg.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { fadeUp, staggerItem } from "@/utils/animations";
import { MagneticButton } from "@/components/MagneticButton";
import AnimatedHeading from "@/components/AnimatedHeading";
import { SpatialCard } from "./spatial/SpatialCard";

const features = [
  { icon: Sprout, title: "Smart Marketplace", desc: "List your produce and reach thousands of buyers worldwide." },
  { icon: Leaf, title: "AI Disease Prediction", desc: "Detect crop diseases early using AI-powered image recognition." },
  { icon: CloudSun, title: "Weather Insights", desc: "Real-time weather data to plan farming activities." },
  { icon: MapPin, title: "Geo Location", desc: "Track and manage your farm plots with precision mapping." },
];

const FeaturesSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.3);

  return (
     <section className="py-28 pb-112 relative overflow-hidden" id="services" ref={sectionRef}>
      <div className="absolute inset-0">
        <img src={servicesBg} alt="Services background" className="w-full h-full object-cover" />
        <div className="absolute inset-0" />
      </div>
      <div className="relative container mx-auto px-6">
        <div className="flex justify-end">
          <div className="w-full lg:w-[85%] ml-[8cm]">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <motion.p variants={fadeUp} initial="hidden" animate={isVisible ? "visible" : "hidden"} className="text-sm font-semibold text-green-700 uppercase tracking-widest mb-4">Our Services</motion.p>
                <motion.h2 variants={fadeUp} initial="hidden" animate={isVisible ? "visible" : "hidden"} transition={{ delay: 0.1 }} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 heading-tight">
                  <AnimatedHeading text="Everything You Need to Grow Your Farm Business" delay={0.1} stagger={0.05} />
                </motion.h2>
                <motion.p variants={fadeUp} initial="hidden" animate={isVisible ? "visible" : "hidden"} transition={{ delay: 0.2 }} className="text-gray-600 text-lg mb-8 max-w-lg body-relaxed">
                  Powerful tools designed specifically for modern farmers.
                </motion.p>
              </div>
              <motion.div variants={staggerItem} initial="hidden" animate={isVisible ? "visible" : "hidden"} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {features.map((f, i) => (
                  <SpatialCard key={f.title} className="bg-white/80 backdrop-blur-sm rounded-xl p-8 group" depth={i * 10} rotationIntensity={4}>
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <f.icon size={32} className="text-green-700" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-xl mb-2">{f.title}</h3>
                      <p className="text-gray-600">{f.desc}</p>
                    </div>
                  </SpatialCard>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;