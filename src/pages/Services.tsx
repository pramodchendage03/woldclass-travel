import { useContent } from "../context/ContentContext";
import { motion } from "motion/react";
import { Map, FileText, Hotel, Plane, Shield, Compass } from "lucide-react";

const iconMap: Record<string, any> = {
  Map, FileText, Hotel, Plane, Shield, Compass
};

export default function Services() {
  const { data } = useContent();
  if (!data) return null;

  return (
    <div className="pb-24">
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 italic serif">Our Premium Services</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">We provide end-to-end solutions for your travel needs, ensuring every detail is handled with precision.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.services.map((service, idx) => {
            const Icon = iconMap[service.icon] || Compass;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 hover:border-blue-500 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 italic serif">Bespoke Travel Planning</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our expert planners work closely with you to understand your desires and craft an itinerary that exceeds your expectations. From private jet charters to exclusive villa rentals, we handle it all.
            </p>
            <ul className="space-y-4">
              {["Personalized Itineraries", "VIP Airport Services", "Private Guided Tours", "Exclusive Access Events"].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"
              alt="Service"
              className="rounded-3xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <p className="text-blue-600 font-bold text-2xl">150+</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Global Partners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
