"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Calendar } from "lucide-react";
import { addBooking } from "@/actions/bookingActions";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  tour: {
    title: string;
    price: string;
  };
  user: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
}

export default function BookingForm({ tour, user }: BookingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  };

  const handleBookingSubmit = async (formData: FormData) => {
    if (!user) {
      handleLoginRedirect();
      return;
    }

    setSubmitting(true);
    try {
      await addBooking(formData);
      alert(
        "Reservation Request Sent! We will contact you shortly to confirm."
      );
    } catch (error) {
      console.error("Booking failed", error);
      alert("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sticky top-32 bg-[#0A1A12] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 border-b border-white/10 pb-6">
        <span className="text-white/50 text-[10px] uppercase tracking-[0.2em] block mb-2">
          Starting from
        </span>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-serif text-white">
            {tour.price}
          </span>
          <span className="text-white/40 text-sm mb-1.5">/ person</span>
        </div>
      </div>

      {!user ? (
        <div className="space-y-6 mb-8">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center mb-4">
              <Lock size={28} className="text-[#f59e0b]" />
            </div>
            <h3 className="text-xl font-serif text-white mb-2">
              Sign In Required
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Please sign in to book this tour. This ensures your
              reservation is linked to your account.
            </p>
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-[#F1D592] cursor-pointer text-[#040C08] font-bold py-4 rounded-xl text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] transform hover:-translate-y-1"
            >
              Sign In to Book
            </button>
          </div>
        </div>
      ) : (
        <form action={handleBookingSubmit} className="space-y-5 mb-8">
          {/* Hidden inputs to secretly pass the tour data to the database */}
          <input type="hidden" name="itemName" value={tour.title} />
          <input type="hidden" name="itemType" value="Tour" />
          <input type="hidden" name="totalPrice" value={tour.price} />

          <div>
            <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
              Full Name
            </label>
            <input
              required
              name="customerName"
              type="text"
              placeholder="e.g. John Doe"
              defaultValue={user.fullName || ""}
              className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
              Email Address
            </label>
            <input
              required
              name="customerEmail"
              type="email"
              placeholder="john@example.com"
              defaultValue={user.email || ""}
              className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
              Travel Date
            </label>
            <input
              required
              name="date"
              type="date"
              className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors appearance-none"
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div>
            <label className="text-white/60 text-[10px] tracking-widest uppercase mb-2 block">
              Guests
            </label>
            <select
              required
              name="guests"
              className="w-full bg-[#040C08] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold/50 appearance-none cursor-pointer"
            >
              <option value="1 Adult" className="bg-[#111]">
                1 Adult
              </option>
              <option value="2 Adults" className="bg-[#111]">
                2 Adults
              </option>
              <option value="3 Adults" className="bg-[#111]">
                3 Adults
              </option>
              <option value="4+ Adults" className="bg-[#111]">
                4+ Adults
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#F1D592] cursor-pointer text-[#040C08] font-bold py-4 rounded-xl text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] transform hover:-translate-y-1 mt-4 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Request to Book"}
          </button>
        </form>
      )}

      {/* Trust Badges */}
      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center text-white/50 text-xs font-light">
          <ShieldCheck size={16} className="text-gold mr-3 opacity-80" /> Secure
          Encryption
        </div>
        <div className="flex items-center text-white/50 text-xs font-light">
          <Calendar size={16} className="text-gold mr-3 opacity-80" /> Flexible
          Rescheduling
        </div>
      </div>
    </div>
  );
}
