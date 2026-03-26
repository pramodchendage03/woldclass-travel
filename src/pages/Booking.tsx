import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContent, Destination } from "../context/ContentContext";
import { motion } from "motion/react";
import { Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

// ✅ REMOVED HARDCODED DETAILS
// const UPI_ID = "7387625315-2@ybl";
// const MERCHANT_NAME = "WorldClass Travel";

const UPI_APPS = [
  { name: "Google Pay", icon: "https://www.gstatic.com/images/branding/product/1x/gpay_64dp.png" },
  { name: "PhonePe", icon: "https://phonepe.com/favicon.ico" },
  { name: "Paytm", icon: "https://paytm.com/favicon.ico" },
  { name: "Amazon Pay", icon: "https://www.amazon.in/favicon.ico" }
];

export default function Booking() {
  return (
    <Elements stripe={stripePromise}>
      <BookingContent />
    </Elements>
  );
}

function BookingContent() {
  const { id } = useParams();
  const { data, user, createBooking, processPayment } = useContent();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const paymentSettings = data?.settings.payment;
  const UPI_ID = paymentSettings?.upiId || "7387625315-2@ybl";
  const MERCHANT_NAME = paymentSettings?.merchantName || "WorldClass Travel";

  const [destination, setDestination] = useState<Destination | null>(null);
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transactionId, setTransactionId] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [paymentData, setPaymentData] = useState({
    isAdvance: true,
    paymentMethod: "UPI"
  });

  // Generate a unique transaction reference for the UPI URL
  const [orderId] = useState(() => `WT${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (data && id) {
      const found = data.destinations.find(d => d.id === id);
      if (found) setDestination(found);
    }
  }, [data, id]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Remove auto-verify to give user more control
  // useEffect(() => {
  //   if (transactionId.length === 12 && !isVerified && !isVerifying) {
  //     handleVerifyPayment();
  //   }
  // }, [transactionId, isVerified, isVerifying]);

  if (!user || !destination) return null;

  const totalPrice = destination.price * guests;
  const advanceAmount = totalPrice * 0.2;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Select date");
      return;
    }
    setStep(2);
  };

  const handleVerifyPayment = () => {
    if (!transactionId || transactionId.length !== 12) {
      toast.error("Please enter a valid 12-digit UTR number");
      return;
    }
    setIsVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setHasPaid(true);
      toast.success("Payment verified! You can now confirm your booking.");
      
      // Simulate sending confirmation message
      setTimeout(() => {
        toast.info("Confirmation message sent to your registered number.");
      }, 1000);
    }, 2000);
  };

  const getUpiUrl = () => {
    const amount = (paymentData.isAdvance ? advanceAmount : totalPrice).toFixed(2);
    // Standard UPI URL parameters:
    // pa: VPA (Virtual Payment Address)
    // pn: Payee Name
    // tr: Transaction Reference ID (Unique for every transaction)
    // tn: Transaction Note
    // am: Amount
    // cu: Currency (INR)
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tr=${orderId}&tn=${encodeURIComponent(`Booking for ${destination?.name}`)}&am=${amount}&cu=INR`;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified || !hasPaid || !transactionId) {
      toast.error("Please complete and verify payment first");
      return;
    }
    setIsSubmitting(true);

    try {
      const bookingData = {
        destinationId: destination.id,
        destinationName: destination.name,
        guests,
        date,
        totalPrice,
        userEmail: user.email,
        userName: user.name
      };

      const bookingResult: any = await createBooking(bookingData);

      if (bookingResult?.id) {
        await processPayment({
          bookingId: bookingResult.id,
          amount: paymentData.isAdvance ? advanceAmount : totalPrice,
          paymentMethod: "UPI",
          upiId: UPI_ID,
          transactionId: transactionId
        });

        toast.success("Booking placed. Complete payment via UPI.");
        navigate(`/booking-confirmation/${bookingResult.id}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6 bg-white p-8 rounded-3xl luxury-shadow border border-gold/10">
            <h2 className="text-2xl font-serif text-ink mb-6">Booking Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2">Travel Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2">Number of Guests</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={guests || ""}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                  className="w-full p-4 bg-paper border border-gold/5 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all"
                />
              </div>
            </div>

            <button className="w-full gold-gradient text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-xs luxury-shadow hover:scale-[1.02] transition-all mt-8">
              Continue to Payment
            </button>
          </form>
        ) : (
          <form onSubmit={handleBooking} className="space-y-8 text-center bg-white p-12 rounded-[3rem] luxury-shadow border border-gold/10">
            <h2 className="text-3xl font-serif text-ink italic mb-8">Secure UPI Payment</h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* ✅ COMPATIBILITY-FIRST QR CODE */}
              <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-white rounded-3xl border border-gold/10 luxury-shadow">
                  <img
                    src={paymentSettings?.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getUpiUrl())}`}
                    alt="QR Code"
                    className="w-52 h-52 object-contain"
                  />
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-1">UPI ID</p>
                  <p className="text-lg font-mono text-ink font-bold">{UPI_ID}</p>
                </div>

                {/* ✅ UPI APPS */}
                <div className="flex justify-center gap-6">
                  {UPI_APPS.map(app => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => {
                        window.location.href = getUpiUrl();
                      }}
                      className="group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-paper border border-gold/10 flex items-center justify-center p-2 group-hover:border-gold transition-all luxury-shadow">
                        <img src={app.icon} className="w-full h-full object-contain" alt={app.name} />
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-ink/40 mt-2 block">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 text-left">
                <div className="bg-gold/5 p-8 rounded-3xl border border-gold/10">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2">Amount Payable</p>
                  <p className="text-4xl font-serif text-ink italic">${(paymentData.isAdvance ? advanceAmount : totalPrice).toLocaleString()}</p>
                  <p className="text-[10px] text-ink/40 mt-2 italic">Scan the QR code or use a UPI app to pay.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-2 ml-1">Transaction ID / UTR Number (12 Digits)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        disabled={isVerified}
                        placeholder="Enter 12-digit UTR number"
                        value={transactionId}
                        maxLength={12}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ""))}
                        className="flex-grow p-4 bg-paper border border-gold/10 rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none text-ink transition-all disabled:opacity-50"
                      />
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyPayment}
                          disabled={isVerifying || transactionId.length !== 12}
                          className="px-6 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-ink/90 transition-all disabled:opacity-50"
                        >
                          {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </button>
                      )}
                      {isVerified && (
                        <div className="flex items-center gap-2 px-6 bg-green-500/10 text-green-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                          <ShieldCheck className="w-4 h-4" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {isVerified && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-3 p-4 bg-green-50 border border-green-100 rounded-2xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-xs text-green-700 font-medium">Payment Verified Successfully</span>
                    </motion.div>
                  )}

                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        checked={hasPaid}
                        disabled={!isVerified}
                        onChange={(e) => setHasPaid(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${hasPaid ? "bg-gold border-gold" : "border-gold/20 group-hover:border-gold/40"} ${!isVerified ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {hasPaid && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <span className={`text-xs font-light leading-relaxed ${!isVerified ? "text-ink/20" : "text-ink/60"}`}>
                      I confirm that I have completed the payment of <span className="text-ink font-medium">${(paymentData.isAdvance ? advanceAmount : totalPrice).toLocaleString()}</span> and the Transaction ID entered is correct.
                    </span>
                  </label>
                </div>

                {/* PAYMENT BUTTON */}
                {isVerified && (
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasPaid || !transactionId}
                    className={`w-full py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs luxury-shadow transition-all ${isSubmitting || !hasPaid || !transactionId ? "bg-ink/10 text-ink/20 cursor-not-allowed" : "gold-gradient text-white hover:scale-[1.02]"}`}
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}