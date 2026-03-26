import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { Mail, Phone, MapPin, Send, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  const { data } = useContent();
  const [submitted, setSubmitted] = useState(false);

  if (!data) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pb-24">
      <div className="bg-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 italic serif">Get in Touch</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">Have questions about your next journey? Our travel experts are here to help you plan the perfect trip.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Us</h3>
                  <p className="text-gray-500 text-sm">hello@worldclass.travel</p>
                  <p className="text-gray-500 text-sm">support@worldclass.travel</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Call Us</h3>
                  <p className="text-gray-500 text-sm">+1 (555) 123-4567</p>
                  <p className="text-gray-500 text-sm">Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Visit Us</h3>
                  <p className="text-gray-500 text-sm">123 Travel Plaza, Suite 456</p>
                  <p className="text-gray-500 text-sm">Global City, GC 78910</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 italic serif">Global Presence</h3>
                <p className="text-gray-400 text-sm mb-6">With offices in London, Tokyo, and New York, we're always close by.</p>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-gray-900" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center text-xs font-bold">+12</div>
                </div>
              </div>
              <Globe className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                  <p className="text-gray-600">Thank you for reaching out. One of our travel experts will contact you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-blue-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none">
                      <option>General Inquiry</option>
                      <option>Booking Request</option>
                      <option>Partnership Opportunity</option>
                      <option>Feedback</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Tell us about your dream trip..."
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="h-96 bg-gray-200 rounded-3xl overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1920&q=80"
            alt="Map"
            className="w-full h-full object-cover opacity-50 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">WorldClass HQ</p>
                <p className="text-gray-500 text-xs">Global City, GC 78910</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
