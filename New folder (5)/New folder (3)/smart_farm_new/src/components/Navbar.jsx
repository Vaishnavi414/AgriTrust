import { useState, useEffect } from "react";
import { Sprout, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

const links = [
    { name: "Products", route: "/products" },
    { name: "AI Prediction", route: "/ai-prediction" },
    { name: "Chatbot", route: "/chatbot" },
    { name: "Geo Location", route: "/geo-location" },
    { name: "Weather", route: "/weather" },
  ];

  const handleNavClick = (link) => {
    if (link.route) {
      navigate(link.route);
    } else if (link.externalUrl) {
      window.open(link.externalUrl, '_blank');
    } else if (link.sectionId) {
      const element = document.getElementById(link.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setMobileOpen(false);
      }
    }
  };

  const handleAuthClick = () => {
    navigate('/register');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="w-full flex items-center justify-between px-8 lg:px-12">
        <a href="#" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Sprout className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
<span className="font-heading text-3xl font-bold text-foreground">
             Agri Trust
           </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className="text-3xl font-medium text-foreground/80 hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full bg-transparent border-none cursor-pointer"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={handleAuthClick}
            className="text-3xl font-medium text-foreground/80 hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full bg-transparent border-none cursor-pointer"
          >
            Register
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
         <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border animate-fade-up">
           <div className="flex flex-col items-center py-4 gap-4">
             {links.map((link) => (
               <button
                 key={link.name}
                 onClick={() => handleNavClick(link)}
                 className="text-lg font-medium text-foreground/80 hover:text-primary bg-transparent border-none cursor-pointer"
               >
                 {link.name}
               </button>
             ))}
             <button
               onClick={handleAuthClick}
               className="text-sm font-medium text-foreground/80 hover:text-primary bg-transparent border-none cursor-pointer"
             >
               Register
             </button>
           </div>
         </div>
       )}
    </nav>
  );
};

export default Navbar;