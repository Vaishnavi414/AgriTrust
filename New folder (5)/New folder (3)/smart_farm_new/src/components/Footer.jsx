import { Sprout } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-farm-dark py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary-foreground/80" />
            <span className="font-heading text-xl font-bold text-primary-foreground">
              Agri Trust
            </span>
          </div>
          <p className="text-primary-foreground/50 text-sm">
            info@agriTrust.com
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            {["Home", "Products", "Services", "About Us"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-primary-foreground transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center">
          <p className="text-primary-foreground/40 text-xs">
            © 2026 Agri Trust. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;