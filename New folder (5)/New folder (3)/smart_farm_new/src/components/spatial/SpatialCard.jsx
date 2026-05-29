import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const SpatialCard = ({ children, className = "", depth = 0, rotationIntensity = 10 }) => {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [rotationIntensity, -rotationIntensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-rotationIntensity, rotationIntensity]);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onMouseMove={handleMouseMove}
      animate={{ rotateX: rotateXSpring, rotateY: rotateYSpring }}
      whileHover={{ scale: 1.03, translateZ: depth + 30 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

export { SpatialCard };
export default SpatialCard;