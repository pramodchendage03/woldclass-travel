import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContent();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      // Check if user is admin and redirect accordingly
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user?.role === 'admin') {
        navigate("/admin");
      } else {
        const from = location.state?.from || "/";
        navigate(from);
      }
    } else {
      setError(result.error || "Invalid email or password.");
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
          <span className="text-gold font-medium tracking-[0.4em] uppercase text-[10px]">Welcome Back</span>
          <h2 className="text-4xl font-serif text-ink italic">Sign In</h2>
          <p className="text-sm text-ink/40 font-light">Please enter your details to continue</p>
        </div>
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
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
              Sign in
            </button>
            <div className="text-center">
              <p className="text-sm text-ink/40 font-light">
                Don't have an account?{" "}
                <button onClick={() => navigate("/signup")} className="text-gold font-bold hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gold/5 flex flex-col items-center space-y-4">
            <p className="text-center text-[10px] text-ink/30 tracking-widest uppercase">
              Secure Access Portal
            </p>
            <button 
              onClick={() => navigate("/admin")}
              className="text-[10px] text-gold/40 hover:text-gold font-bold uppercase tracking-[0.3em] transition-colors"
            >
              Management Portal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
