"use client";

import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createContactSubmission } from "@/actions/contactActions";
import { checkAuthStatus } from "@/actions/authActions";

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
// -------------------------------------------------------

// Validation Schema for the Contact Form
const contactSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(1, "Please select a subject."),
  message: z
    .string()
    .min(10, "Your message must be at least 10 characters long."),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Check auth status on mount
  React.useEffect(() => {
    async function loadUser() {
      try {
        const authResult = await checkAuthStatus();
        if (authResult.authenticated && authResult.user) {
          setUser(authResult.user);
          // Pre-fill form with user data
          setValue("fullName", authResult.user.fullName || "");
          setValue("email", authResult.user.email || "");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [setValue]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const result = await createContactSubmission(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to submit contact form");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-safari-green selection:bg-gold selection:text-safari-green pb-0">
      {/* Cinematic Hero Header */}
      <section className="relative h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop"
            alt="Kigali Rwanda"
            className="w-full h-full object-cover opacity-30 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-linear-to-t from-safari-green via-safari-green/80 to-safari-green/30" />
        </div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold tracking-[0.4em] uppercase text-xs font-bold">
              Concierge Desk
            </span>
            <span className="h-px w-8 bg-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-lg"
          >
            Connect With <span className="italic text-gold-light">OJO</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            Whether you are ready to book a bespoke safari or simply have a
            question about Rwanda, our luxury travel experts are at your service
            round the clock.
          </motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Contact Info & Map (Takes up 2/5 width) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact Details Card */}
            <div className="bg-safari-emerald/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <h3 className="text-2xl font-serif text-white mb-8">
                Headquarters
              </h3>

              <div className="space-y-8 relative z-10">
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-5 shrink-0 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <MapPin className="text-gold" size={20} />
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-1">
                      Office Location
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">
                      KG 7 Avenue, Heights Tower
                      <br />
                      Kigali City, Rwanda
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-5 shrink-0 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <Phone className="text-gold" size={20} />
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-1">
                      Direct Line
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">
                      +250 788 000 000
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-5 shrink-0 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <Mail className="text-gold" size={20} />
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-1">
                      Email Us
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">
                      concierge@ojotours.com
                    </p>
                  </div>
                </div>

                {/* 🚀 NEW: Business Hours */}
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-5 shrink-0 group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <Clock className="text-gold" size={20} />
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-1">
                      Operating Hours
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">
                      Mon - Fri: 8:00 AM - 6:00 PM
                      <br />
                      <span className="text-white/50 text-sm">
                        24/7 Support for Active Guests
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-white/10 my-8" />

              {/* Social Media & WhatsApp */}
              <div className="space-y-6">
                <a
                  href="https://wa.me/250788000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white text-[#25D366] py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all duration-300 group shadow-lg"
                >
                  <MessageCircle
                    size={18}
                    className="mr-3 group-hover:scale-110 transition-transform"
                  />{" "}
                  Chat on WhatsApp
                </a>

                <div className="flex items-center justify-between px-2">
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">
                    Follow Our Journey
                  </span>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-white/40 hover:text-gold hover:scale-110 transition-all"
                    >
                      <InstagramIcon size={20} />
                    </a>
                    <a
                      href="#"
                      className="text-white/40 hover:text-gold hover:scale-110 transition-all"
                    >
                      <FacebookIcon size={20} />
                    </a>
                    <a
                      href="#"
                      className="text-white/40 hover:text-gold hover:scale-110 transition-all"
                    >
                      <TwitterIcon size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 UPGRADED: Real Interactive Google Map (Grayscale to match luxury theme) */}
            <div className="relative h-[300px] w-full rounded-3xl overflow-hidden border border-white/10 group shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127642.14815467363!2d30.010539158203126!3d-1.9536066000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1716000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter:
                    "grayscale(100%) invert(90%) contrast(1.2) opacity(0.8)",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="group-hover:opacity-100 transition-opacity duration-700"
              ></iframe>
              <div className="absolute inset-0 bg-safari-green/20 mix-blend-multiply pointer-events-none" />
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Contact Form (Takes up 3/5 width) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 relative h-fit"
          >
            {/* Ambient background glow for the form */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative bg-safari-emerald/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {isSubmitSuccessful ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24"
                >
                  <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <CheckCircle size={48} className="text-gold" />
                  </div>
                  <h3 className="text-4xl font-serif text-white mb-4">
                    Inquiry Received
                  </h3>
                  <p className="text-white/60 leading-relaxed mb-10 max-w-md mx-auto font-light text-lg">
                    Thank you for reaching out to OJO Tours. Our concierge team
                    has received your message and will respond to your inquiry
                    shortly.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-transparent border border-gold hover:bg-gold hover:text-safari-green text-gold px-10 py-4 rounded-full font-bold tracking-[0.2em] uppercase text-xs transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-10">
                    <h2 className="text-4xl font-serif text-white mb-3">
                      Send an Inquiry
                    </h2>
                    <p className="text-white/50 text-base font-light">
                      Fill out the form below and a dedicated travel specialist
                      will get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] ml-1">
                          Full Name
                        </label>
                        <input
                          {...register("fullName")}
                          type="text"
                          placeholder="Matthias Komano"
                          disabled={user !== null}
                          className={`w-full bg-black/20 border ${errors.fullName ? "border-red-500/50" : "border-white/10"} rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/50 focus:bg-black/40 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                        {errors.fullName && (
                          <p className="text-red-400 text-[10px] ml-1 mt-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] ml-1">
                          Email Address
                        </label>
                        <input
                          {...register("email")}
                          type="email"
                          placeholder="matthias@example.com"
                          disabled={user !== null}
                          className={`w-full bg-black/20 border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/50 focus:bg-black/40 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                        {errors.email && (
                          <p className="text-red-400 text-[10px] ml-1 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject Dropdown */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] ml-1">
                        Subject
                      </label>
                      <select
                        {...register("subject")}
                        defaultValue=""
                        className={`w-full bg-black/20 border ${errors.subject ? "border-red-500/50" : "border-white/10"} rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold/50 focus:bg-black/40 transition-all text-sm appearance-none cursor-pointer`}
                      >
                        <option value="" disabled className="bg-[#0A1A12]">
                          How can we assist you?
                        </option>
                        <option
                          value="General Inquiry"
                          className="bg-[#0A1A12]"
                        >
                          General Inquiry
                        </option>
                        <option
                          value="Custom Tour Request"
                          className="bg-[#0A1A12]"
                        >
                          Custom Tour Request
                        </option>
                        <option value="Partnership" className="bg-[#0A1A12]">
                          Business Partnership
                        </option>
                        <option value="Press" className="bg-[#0A1A12]">
                          Media & Press
                        </option>
                      </select>
                      {errors.subject && (
                        <p className="text-red-400 text-[10px] ml-1 mt-1">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/50 uppercase tracking-[0.2em] ml-1">
                        Your Message
                      </label>
                      <textarea
                        {...register("message")}
                        rows={6}
                        placeholder="Share your thoughts, questions, or specific requirements for your upcoming African adventure..."
                        className={`w-full bg-black/20 border ${errors.message ? "border-red-500/50" : "border-white/10"} rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/50 focus:bg-black/40 transition-all text-sm resize-none`}
                      />
                      {errors.message && (
                        <p className="text-red-400 text-[10px] ml-1 mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex justify-center items-center bg-[#F1D592] disabled:bg-gold/30 disabled:text-safari-green/50 disabled:cursor-not-allowed cursor-pointer text-[#040C08] font-bold px-10 py-5 rounded-xl transition-all duration-500 text-xs tracking-[0.2em] uppercase mt-8 shadow-[0_0_30px_rgba(212,175,55,0.4)] transform hover:-translate-y-1 w-full md:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-3" />{" "}
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-3" /> Send Inquiry
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
