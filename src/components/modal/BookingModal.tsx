"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Phone,
  MessageSquare,
  Loader2,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createItineraryBooking } from "@/actions/bookingActions";
import { checkAuthStatus } from "@/actions/authActions";
import { useRouter } from "next/navigation";

// 1. Define the Validation Schema using Zod
const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(8, "Please enter a valid phone number."),
  experience: z.string().min(1, "Please select a desired experience."),
  date: z.string().min(1, "Please specify your preferred travel dates."),
  guests: z.string().min(1, "Please select the party size."),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      experience: "",
      guests: "2",
    },
  });

  // Check authentication and fetch user data when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkAuth = async () => {
        setIsLoading(true);
        try {
          const result = await checkAuthStatus();
          setIsAuthenticated(result.authenticated);
          if (result.authenticated && result.user) {
            setUser(result.user);
            // Auto-fill form with user data
            setValue("fullName", result.user.fullName || "");
            setValue("email", result.user.email || "");
            setValue("phone", result.user.phone || "");
          }
        } catch (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };
      checkAuth();
    }
  }, [isOpen, setValue]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => reset(), 300);
      setUser(null);
    }
  }, [isOpen, reset]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    onClose();
  };

  // 3. 🚀 Handle Form Submission (Now actually connected to Database!)
  const onSubmit = async (data: BookingFormData) => {
    try {
      // Send the data directly to your Postgres database & trigger the email
      await createItineraryBooking(data);
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6 overflow-y-auto">
          {/* Dark Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* 🚀 UPGRADED MODAL: Crisp, Modern White Theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden my-auto"
          >
            {/* Top Gold Accent Line */}
            <div className="h-1.5 w-full bg-linear-to-r from-[#D4AF37] via-[#F1D592] to-[#D4AF37]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all"
            >
              <X size={18} />
            </button>

            <div className="p-8 md:p-10">
              {/* SUCCESS STATE UI */}
              {isSubmitSuccessful ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-4xl font-serif text-gray-900 mb-4">
                    Request Received
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed mb-10 max-w-md mx-auto">
                    Thank you for choosing OJO Tours. A luxury travel curator
                    will review your details and contact you within 24 hours.
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-gold bg-[#F1D592] cursor-pointer text-[#040C08] px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all duration-300 shadow-lg"
                  >
                    Return to Experience
                  </button>
                </motion.div>
              ) : isLoading ? (
                /* LOADING STATE */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Loader2
                    size={32}
                    className="animate-spin text-gold mx-auto mb-4"
                  />
                  <p className="text-gray-500 text-sm">
                    Verifying authentication...
                  </p>
                </motion.div>
              ) : !isAuthenticated ? (
                /* AUTHENTICATION REQUIRED UI */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Lock size={40} className="text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-serif text-gray-900 mb-3">
                    Authentication Required
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-md mx-auto">
                    Please sign in to request a custom itinerary. This allows us
                    to provide personalized service and track your travel
                    preferences.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full bg-[#F1D592] cursor-pointer text-[#040C08] px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all duration-300 shadow-lg mb-3"
                  >
                    Sign In to Continue
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-gray-500 cursor-pointer hover:text-gray-700 text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                /* BOOKING FORM UI */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <header className="mb-8">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles size={14} className="text-gold" />
                      <span className="text-gold tracking-[0.2em] uppercase text-[10px] font-bold">
                        Tailored Excellence
                      </span>
                    </div>
                    <h2 className="text-4xl font-serif text-gray-900 mb-3">
                      Request an Itinerary
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Define your preferences and allow us to orchestrate your
                      journey.
                    </p>
                  </header>

                  <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* Identity Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">
                          Full Name
                        </label>
                        <input
                          {...register("fullName")}
                          type="text"
                          placeholder="Jane Doe"
                          className={`w-full bg-gray-50 border ${errors.fullName ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm`}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">
                          Email Address
                        </label>
                        <input
                          {...register("email")}
                          type="email"
                          placeholder="jane@example.com"
                          className={`w-full bg-gray-50 border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact & Experience Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 flex items-center">
                          <Phone size={12} className="mr-1.5 text-gold" /> Phone
                          Number
                        </label>
                        <input
                          {...register("phone")}
                          type="tel"
                          placeholder="+250 788 000 000"
                          className={`w-full bg-gray-50 border ${errors.phone ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 flex items-center">
                          <MapPin size={12} className="mr-1.5 text-gold" />{" "}
                          Desired Experience
                        </label>
                        <select
                          {...register("experience")}
                          className={`w-full bg-gray-50 border ${errors.experience ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm appearance-none cursor-pointer`}
                        >
                          <option value="" disabled>
                            Select an adventure...
                          </option>
                          <option value="Gorilla Trekking">
                            Silverback Gorilla Trekking
                          </option>
                          <option value="Akagera Safari">
                            Akagera Wildlife Safari
                          </option>
                          <option value="Lake Kivu Escape">
                            Lake Kivu Luxury Escape
                          </option>
                          <option value="Nyungwe Chimpanzees">
                            Chimpanzee Tracking
                          </option>
                          <option value="Custom Tailored Journey">
                            Custom Tailored Journey
                          </option>
                        </select>
                        {errors.experience && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.experience.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logistics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 flex items-center">
                          <Calendar size={12} className="mr-1.5 text-gold" />{" "}
                          Preferred Dates
                        </label>
                        <input
                          {...register("date")}
                          type="date"
                          className={`w-full bg-gray-50 border ${errors.date ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm appearance-none`}
                          style={{ colorScheme: "light" }}
                        />
                        {errors.date && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.date.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 flex items-center">
                          <Users size={12} className="mr-1.5 text-gold" /> Party
                          Size
                        </label>
                        <select
                          {...register("guests")}
                          className={`w-full bg-gray-50 border ${errors.guests ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm appearance-none cursor-pointer`}
                        >
                          <option value="1 Traveler">1 Traveler</option>
                          <option value="2 Travelers">2 Travelers</option>
                          <option value="3 Travelers">3 Travelers</option>
                          <option value="4+ Travelers">4+ Travelers</option>
                        </select>
                        {errors.guests && (
                          <p className="text-red-500 text-[10px] ml-1">
                            {errors.guests.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1 flex items-center">
                        <MessageSquare size={12} className="mr-1.5 text-gold" />{" "}
                        Special Requests (Optional)
                      </label>
                      <textarea
                        {...register("specialRequests")}
                        rows={3}
                        placeholder="Dietary requirements, celebrations, accessibility..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Submit Action */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center bg-[#F1D592] cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#040C08] font-bold py-4 rounded-xl transition-all duration-300 text-sm tracking-widest uppercase mt-4 shadow-[0_15px_30px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />{" "}
                          Processing Request
                        </>
                      ) : (
                        "Initialize Request"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
