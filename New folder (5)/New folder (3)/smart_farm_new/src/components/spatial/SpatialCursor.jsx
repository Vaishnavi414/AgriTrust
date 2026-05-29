import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const SpatialCursor = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      const isInteractive = target.closest("button, a, input, textarea") !== null;
      setIsOverInteractive(isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springConfig = { damping: 20, stiffness: 300 };
  const glowSpring = { damping: 15, stiffness: 100 };
  
  const x = useSpring(cursorPos.x, springConfig);
  const y = useSpring(cursorPos.y, springConfig);
  const glowX = useSpring(cursorPos.x, glowSpring);
  const glowY = useSpring(cursorPos.y, glowSpring);

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9995]"
        style={{ x: glowX, y: glowY }}
      >
        <div
          className="rounded-full"
          style={{
            width: isOverInteractive ? 600 : 400,
            height: isOverInteractive ? 600 : 400,
            background: `radial-gradient(circle, rgba(34, 197, 94, ${isOverInteractive ? 0.12 : 0.06}) 0%, rgba(34, 197, 94, ${isOverInteractive ? 0.04 : 0.01}) 40%, transparent 70%)`,
            filter: "blur(40px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-[9996]"
        style={{ x, y }}
      >
        <div
          className="rounded-full"
          style={{
            width: isOverInteractive ? 60 : 40,
            height: isOverInteractive ? 60 : 40,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(34, 197, 94, 0.6) 60%, rgba(34, 197, 94, 0.2) 100%)`,
            boxShadow: isOverInteractive ? "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)" : "0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)",
            transform: "translate(-50%, -50%)",
            filter: "blur(1px)",
          }}
        />
      </motion.div>

      <motion.div className="fixed pointer-events-none z-[9997]" style={{ x, y }}>
        <div
          className="rounded-full bg-green-500"
          style={{
            width: 6,
            height: 6,
            boxShadow: isOverInteractive ? "0 0 10px rgba(34, 197, 94, 1)" : "0 0 6px rgba(34, 197, 94, 0.8)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>
    </>
  );
};

export default SpatialCursor;