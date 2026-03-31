import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { Menu, X, Globe, User, ShieldCheck, LogOut, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { data, user, isAdmin, logout } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!data) return null;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled ? "bg-white/90 backdrop-blur-md py-4 luxury-shadow" : "bg-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center luxury-shadow group-hover:scale-110 transition-transform">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-serif tracking-tighter text-ink">
              WorldClass<span className="text-gold font-light italic">Travel</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold uppercase tracking-[0.2em] transition-all hover:text-gold relative group ${
                  location.pathname === link.path ? "text-gold" : "text-ink/70"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gold transition-all group-hover:w-full ${
                  location.pathname === link.path ? "w-full" : ""
                }`} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-gold hover:text-gold-dark transition-colors px-4 py-2 rounded-xl bg-gold/5 border border-gold/20"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
                  </Link>
                )}
                <Link to="/my-bookings" className="flex items-center space-x-2 text-ink/70 hover:text-gold transition-colors" title="My Bookings">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Bookings</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-ink/70 hover:text-gold transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-ink/70 hover:text-gold transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-widest text-ink/70 hover:text-gold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="gold-gradient text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest luxury-shadow hover:opacity-90 transition-opacity"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gold/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-4 text-sm font-bold uppercase tracking-widest text-ink/70 hover:bg-gold/5 hover:text-gold rounded-xl transition-all"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 mt-6 border-t border-gold/10 space-y-4">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-4 text-gold bg-gold/5 rounded-xl"
                      >
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-4 text-ink/70"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">My Profile</span>
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-4 text-ink/70"
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">My Bookings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-4 text-ink/70"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 px-4">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center py-4 text-sm font-bold uppercase tracking-widest text-ink/70 border border-gold/20 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center py-4 text-sm font-bold uppercase tracking-widest text-white gold-gradient rounded-xl"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
