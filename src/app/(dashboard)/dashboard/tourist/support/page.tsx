"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TouristSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tourist">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Support
            </h1>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Message Sent!
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for reaching out. Our support team will get back to you
            within 24-48 hours.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            className="bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tourist">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Support Center
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Get help with your bookings, trips, and account
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Send us a message</CardTitle>
              <CardDescription className="text-sm">
                Fill out the form below and we'll get back to you as soon as
                possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription className="text-sm">
                Reach out to us directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#90caf9] to-[#047edf] flex items-center justify-center shadow-sm shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">support@ojotours.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#84d9d2] to-[#07cdae] flex items-center justify-center shadow-sm shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffbf96] to-[#fe7096] flex items-center justify-center shadow-sm shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Live Chat</p>
                  <p className="text-sm text-gray-600">Available 9am - 6pm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">FAQ</CardTitle>
              <CardDescription className="text-sm">
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">
                  How do I cancel a booking?
                </p>
                <p className="text-gray-600">
                  Go to My Bookings and click the cancel button on pending
                  bookings.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">
                  How do I update my profile?
                </p>
                <p className="text-gray-600">
                  Visit the Profile page in your dashboard to edit your
                  information.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">
                  What payment methods do you accept?
                </p>
                <p className="text-gray-600">
                  We accept credit cards, PayPal, and bank transfers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
