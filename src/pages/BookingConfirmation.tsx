import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, Calendar, Users, MapPin, CreditCard, ArrowRight, Download, Mail, Phone, MessageSquare, ShieldCheck } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContent();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentInfo = location.state?.paymentInfo;

  const downloadInvoice = () => {
    if (!booking) return;

    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("WorldClass Travel Agency", 20, 40);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Luxury Experiences, Global Destinations", 20, 45);
    doc.text("Email: concierge@worldclass.travel", 20, 50);
    
    // Invoice Info
    doc.setTextColor(20, 20, 20);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 140, 40);
    doc.text(`Booking ID: #${booking.id}`, 140, 45);
    doc.text(`Status: ${booking.paymentStatus}`, 140, 50);

    // Customer Info
    doc.setFontSize(12);
    doc.text("Billed To:", 20, 70);
    doc.setFontSize(10);
    doc.text(booking.userName || user?.name || "Valued Customer", 20, 75);
    doc.text(booking.userEmail || user?.email || "", 20, 80);

    // Table
    const tableData = [
      ["Destination", booking.destinationName || "N/A"],
      ["Travel Date", booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"],
      ["Guests", (booking.guests || 0).toString()],
      ["Rate per Guest", `$${((booking.totalPrice || 0) / (booking.guests || 1)).toLocaleString()}`],
      ["Total Amount", `$${(booking.totalPrice || 0).toLocaleString()}`],
      ["Amount Paid", `$${(booking.paidAmount || 0).toLocaleString()}`],
      ["Balance Due", `$${((booking.totalPrice || 0) - (booking.paidAmount || 0)).toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 90,
      head: [["Description", "Details"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [197, 165, 114] }, // Gold color
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Thank you for choosing WorldClass Travel.", 105, finalY, { align: "center" });
    doc.text("Your luxury escape awaits.", 105, finalY + 5, { align: "center" });

    doc.save(`Invoice_${booking.id}.pdf`);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/bookings/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const bookingData = await res.json();
          setBooking(bookingData);
        }
      } catch (err) {
        console.error("Failed to fetch booking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-serif text-ink mb-4">Booking Not Found</h2>
          <p className="text-ink/60 mb-8">We couldn't find the booking details you're looking for.</p>
          <Link to="/my-bookings" className="gold-gradient text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow inline-block">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] luxury-shadow border border-gold/10 overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gold/[0.03] p-12 md:p-16 text-center border-b border-gold/5">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-8 luxury-border">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Reservation Confirmed</span>
            <h1 className="text-5xl font-serif text-ink italic mb-6">Bon Voyage, {user?.name}!</h1>
            <p className="text-ink/60 text-lg font-light max-w-xl mx-auto leading-relaxed">
              Your luxury escape to <span className="text-ink font-medium">{booking.destinationName}</span> is officially secured. We've sent a detailed itinerary to your email.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <Mail className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Email Sent to User</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <MessageSquare className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">SMS Sent to User</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin Notified</span>
              </div>
            </div>
          </div>

          <div className="p-12 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Booking Summary */}
              <div className="space-y-10">
                <h3 className="text-xl font-serif text-ink italic border-b border-gold/10 pb-4">Booking Summary</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Destination</span>
                      <p className="text-ink font-medium">{booking.destinationName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Travel Date</span>
                      <p className="text-ink font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Guests</span>
                      <p className="text-ink font-medium">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gold/5 rounded-xl text-gold luxury-border">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest block mb-1">Booking ID</span>
                      <p className="font-mono text-sm text-ink">#{booking.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-10">
                <h3 className="text-xl font-serif text-ink italic border-b border-gold/10 pb-4">Payment Details</h3>
                
                <div className="bg-paper p-8 rounded-3xl border border-gold/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Status</span>
                    <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Total Package</span>
                    <span className="text-ink font-medium">${(booking.totalPrice || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gold/10">
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Amount Paid Today</span>
                    <span className="text-2xl font-serif text-gold">${(booking.paidAmount || paymentInfo?.amount || 0).toLocaleString()}</span>
                  </div>

                  {booking.latestPayment && (
                    <div className="flex justify-between items-center pt-4 border-t border-gold/10">
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Payment Method</span>
                      <span className="text-ink text-xs font-medium">
                        {booking.latestPayment.method === "Card" ? `Card ending in ${booking.latestPayment.last4}` : 
                         booking.latestPayment.method === "UPI" ? `UPI: ${booking.latestPayment.upiId}` : 
                         `Net Banking: ${booking.latestPayment.bankName}`}
                      </span>
                    </div>
                  )}

                  {booking.status === "Advance Paid" && (
                    <div className="mt-6 p-4 bg-gold/5 rounded-2xl border border-gold/10">
                      <p className="text-[10px] text-gold font-medium leading-relaxed">
                        Remaining balance of <span className="font-bold">${((booking.totalPrice || 0) - (booking.paidAmount || 0)).toLocaleString()}</span> will be due 30 days before departure.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={downloadInvoice}
                    className="w-full flex items-center justify-center space-x-3 px-8 py-4 border border-gold/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-paper transition-all group"
                  >
                    <Download className="h-4 w-4 text-gold group-hover:translate-y-0.5 transition-transform" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-20 pt-16 border-t border-gold/10">
              <h3 className="text-2xl font-serif text-ink italic mb-10 text-center">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-paper rounded-full flex items-center justify-center mx-auto text-gold font-serif italic text-xl border border-gold/10">1</div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest">Check Email</h4>
                  <p className="text-ink/40 text-xs leading-relaxed">A confirmation email with your booking voucher and travel guide is on its way.</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-paper rounded-full flex items-center justify-center mx-auto text-gold font-serif italic text-xl border border-gold/10">2</div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest">Personal Concierge</h4>
                  <p className="text-ink/40 text-xs leading-relaxed">Your dedicated travel expert will contact you within 24 hours to customize your experience.</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-paper rounded-full flex items-center justify-center mx-auto text-gold font-serif italic text-xl border border-gold/10">3</div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest">Prepare for Luxury</h4>
                  <p className="text-ink/40 text-xs leading-relaxed">Start packing! You can manage your booking and add extras anytime in your dashboard.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/my-bookings" className="w-full sm:w-auto text-center px-12 py-5 border border-gold/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-paper transition-all">
                Manage My Bookings
              </Link>
              <Link to="/" className="w-full sm:w-auto text-center gold-gradient text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] luxury-shadow flex items-center justify-center group">
                Back to Home <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Support Footer */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-gold/5">
          <p className="text-ink/40 text-xs mb-4 md:mb-0">Need assistance with your booking?</p>
          <div className="flex space-x-8">
            <a href="mailto:concierge@worldclass.travel" className="flex items-center text-gold hover:text-ink transition-colors text-xs font-medium">
              <Mail className="h-4 w-4 mr-2" /> concierge@worldclass.travel
            </a>
            <a href="tel:+1234567890" className="flex items-center text-gold hover:text-ink transition-colors text-xs font-medium">
              <Phone className="h-4 w-4 mr-2" /> +1 (234) 567-890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
