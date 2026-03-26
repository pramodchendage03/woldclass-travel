import { motion } from "motion/react";
import { useContent } from "../context/ContentContext";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { data } = useContent();
  if (!data) return null;

  const { home } = data.content;

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={home.heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {home.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl font-light">
              {home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/destinations"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center transition-all transform hover:scale-105"
              >
                Explore Destinations <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-semibold flex items-center justify-center transition-all"
              >
                Book a Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 italic serif">Featured Destinations</h2>
            <p className="text-gray-600 max-w-xl">Handpicked locations for your next unforgettable journey.</p>
          </div>
          <Link to="/destinations" className="text-blue-600 font-semibold flex items-center hover:underline">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.destinations.slice(0, 3).map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden mb-4">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase tracking-widest">
                  {dest.type}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{dest.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{dest.description}</p>
              <p className="text-blue-600 font-bold">From ${dest.price}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why WorldClass Travel?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We redefine luxury travel through personalized service and exclusive access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Star, title: "Premium Selection", desc: "Only the finest hotels and experiences make it to our list." },
              { icon: Shield, title: "Secure Booking", desc: "Your safety and security are our top priorities throughout your journey." },
              { icon: Clock, title: "24/7 Support", desc: "Our global team is always available to assist you, anywhere in the world." }
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl p-12 md:p-20 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 italic serif">"The most seamless travel experience I've ever had. WorldClass truly lives up to its name."</h2>
            <div className="flex items-center space-x-4">
              <img
                src="https://i.pravatar.cc/150?u=sarah"
                alt="Sarah"
                className="w-12 h-12 rounded-full border-2 border-white/50"
              />
              <div>
                <p className="font-bold">Sarah Jenkins</p>
                <p className="text-blue-200 text-sm italic">Luxury Traveler</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50" />
        </div>
      </section>
    </div>
  );
}
