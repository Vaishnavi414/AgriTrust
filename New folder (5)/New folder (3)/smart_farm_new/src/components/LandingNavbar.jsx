import { useState, useEffect } from "react";
import { Sprout, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/utils/animations";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = ["Home", "Products", "Services", "About Us", "Register"];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-nav shadow-lg py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <motion.a
          href="#"
          className="flex items-center gap-2 group"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sprout className="h-8 w-8 text-primary" />
          </motion.div>
           <span className="font-heading text-2xl font-bold text-foreground heading-tight">
             Agri Trust
           </span>
        </motion.a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-foreground/80 relative overflow-hidden group"
              whileHover={{ y: -2 }}
              variants={fadeUp}
            >
              <span className="relative z-10">{link}</span>
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.a>
          ))}
        </div>

        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
          whileTap={{ scale: 0.9 }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden glass-nav border-t border-border/50"
          >
            <div className="flex flex-col items-center py-4 gap-4">
              {links.map((link) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-foreground/80"
                  onClick={() => setMobileOpen(false)}
                  whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;