import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { Menu, X, Globe, User, ShieldCheck, LogOut, Briefcase, Search, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { data, user, isAdmin, logout } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const searchResults = searchQuery.length > 1 ? [
    ...(data?.destinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase())).map(d => ({ ...d, type: 'destination' })) || []),
    ...(data?.services.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase())).map(s => ({ ...s, name: s.title, type: 'service' })) || [])
  ].slice(0, 5) : [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  if (!data) return null;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "FAQ", path: "/faq" },
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
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ink/70 hover:text-gold transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
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
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ink/70"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-xl flex flex-col items-center pt-32 px-4"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-10 h-10" />
            </button>

            <div className="w-full max-w-3xl">
              <div className="relative mb-12">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold w-8 h-8" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Where would you like to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-20 pr-8 py-8 bg-white/5 border-b-2 border-gold/30 focus:border-gold outline-none text-3xl font-serif text-white placeholder:text-white/20 transition-all"
                />
              </div>

              <div className="space-y-4">
                {searchResults.map((result: any) => (
                  <Link
                    key={result.id}
                    to={result.type === 'destination' ? `/destinations/${result.id}` : `/services/${result.id}`}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      {result.type === 'destination' ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden">
                          <img src={result.image} className="w-full h-full object-cover" alt={result.name} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-gold" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-serif text-white italic">{result.name}</h4>
                        <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{result.type}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-gold group-hover:translate-x-2 transition-all" />
                  </Link>
                ))}
                {searchQuery.length > 1 && searchResults.length === 0 && (
                  <p className="text-center text-white/40 font-serif italic text-xl">No results found for "{searchQuery}"</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
