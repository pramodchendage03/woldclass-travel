import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { signup } = useContent();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup(email, password, name);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-10 bg-white p-12 rounded-[2.5rem] luxury-shadow border border-gold/10"
      >
        <div className="text-center space-y-2">
          <span className="text-gold font-medium tracking-[0.4em] uppercase text-[10px]">Start Your Journey</span>
          <h2 className="text-4xl font-serif text-ink italic">Join Us</h2>
          <p className="text-sm text-ink/40 font-light">Create an account to begin your experience</p>
        </div>
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <div className="space-y-6">
            <button
              type="submit"
              className="w-full gold-gradient text-white py-4 px-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] luxury-shadow hover:scale-[1.02] transition-all"
            >
              Create Account
            </button>
            <div className="text-center">
              <p className="text-sm text-ink/40 font-light">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-gold font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
