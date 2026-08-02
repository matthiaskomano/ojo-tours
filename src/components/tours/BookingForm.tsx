"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addBooking } from "@/actions/bookingActions";
import { checkAvailability } from "@/actions/availabilityActions";
import { calculateFinalPrice } from "@/actions/pricingActions";
import { addToWaitlist } from "@/actions/waitlistActions";
import { Users, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

interface BookingFormProps {
  itemId: string;
  itemType: "Tour" | "Lodge";
  basePrice: number;
  itemName: string;
}

export default function BookingForm({
  itemId,
  itemType,
  basePrice,
  itemName,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    guests: 1,
    paymentType: "Full" as "Full" | "Deposit",
    specialRequests: "",
  });

  const [availability, setAvailability] = useState<any>(null);
  const [priceDetails, setPriceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAvailabilityAndPrice = async () => {
      if (formData.date && formData.guests > 0) {
        setLoading(true);
        try {
          const availabilityCheck = await checkAvailability(
            itemId,
            itemType,
            new Date(formData.date),
            formData.guests,
          );
          setAvailability(availabilityCheck);

          if (availabilityCheck.available) {
            const pricing = await calculateFinalPrice(
              itemId,
              itemType,
              new Date(formData.date),
              formData.guests,
              basePrice,
            );
            setPriceDetails(pricing);
          } else {
            setPriceDetails(null);
          }
        } catch (error) {
          console.error("Failed to check availability/price:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAvailabilityAndPrice();
  }, [formData.date, formData.guests, itemId, itemType, basePrice]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Invalid email address";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (formData.guests < 1) {
      newErrors.guests = "At least 1 guest is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!availability?.available) {
      setErrors({ date: "Selected date is not available" });
      return;
    }

    setSubmitting(true);

    try {
      const bookingFormData = new FormData();
      bookingFormData.append("itemId", itemId);
      bookingFormData.append("itemType", itemType);
      bookingFormData.append("customerName", formData.customerName);
      bookingFormData.append("customerEmail", formData.customerEmail);
      bookingFormData.append("customerPhone", formData.customerPhone);
      bookingFormData.append("date", formData.date);
      bookingFormData.append("guests", formData.guests.toString());
      bookingFormData.append(
        "totalPrice",
        (
          priceDetails?.totalFinalPrice || basePrice * formData.guests
        ).toString(),
      );
      bookingFormData.append("paymentType", formData.paymentType);
      bookingFormData.append(
        "depositAmount",
        (
          priceDetails?.totalFinalPrice * 0.3 ||
          basePrice * formData.guests * 0.3
        ).toString(),
      );
      bookingFormData.append("specialRequests", formData.specialRequests);

      const result = await addBooking(bookingFormData);

      if (result?.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          date: "",
          guests: 1,
          paymentType: "Full",
          specialRequests: "",
        });
        setAvailability(null);
        setPriceDetails(null);
      } else {
        setErrors({ submit: result?.error || "Failed to submit booking" });
      }
    } catch (error) {
      console.error("Failed to submit booking:", error);
      setErrors({ submit: "Failed to submit booking. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await addToWaitlist({
        itemId,
        itemType,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        preferredDate: new Date(formData.date),
        guests: formData.guests,
      });

      if (result?.success) {
        setSuccess(true);
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          date: "",
          guests: 1,
          paymentType: "Full",
          specialRequests: "",
        });
      } else {
        setErrors({ submit: result?.error || "Failed to add to waitlist" });
      }
    } catch (error) {
      console.error("Failed to add to waitlist:", error);
      setErrors({ submit: "Failed to add to waitlist. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          {showWaitlist ? "Added to Waitlist" : "Booking Submitted!"}
        </h3>
        <p className="text-green-700">
          {showWaitlist
            ? "We'll contact you when a spot becomes available."
            : "Your booking request has been submitted successfully. We'll send you a confirmation email shortly."}
        </p>
        <Button
          onClick={() => {
            setSuccess(false);
            setShowWaitlist(false);
          }}
          className="mt-4"
        >
          Book Another
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book {itemName}</h2>

      {showWaitlist ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Join Waitlist</h4>
              <p className="text-sm text-blue-700">
                This date is currently unavailable. Join our waitlist and we'll
                contact you when a spot becomes available.
              </p>
            </div>
          </div>
        </div>
      ) : (
        availability &&
        !availability.available && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">
                  Date Unavailable
                </h4>
                <p className="text-sm text-yellow-700">
                  {availability.reason ||
                    "This date is not available. Please choose another date or join the waitlist."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWaitlist(true)}
                  className="mt-2"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          </div>
        )
      )}

      <form
        onSubmit={showWaitlist ? handleWaitlistSubmit : handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              className={errors.customerEmail ? "border-red-500" : ""}
            />
            {errors.customerEmail && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerEmail}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date
                    ? format(new Date(formData.date), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      date: date?.toISOString().split("T")[0] || "",
                    })
                  }
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests *
            </label>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-400 mr-2" />
              <Input
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guests: parseInt(e.target.value) || 1,
                  })
                }
                className={errors.guests ? "border-red-500" : ""}
              />
            </div>
            {errors.guests && (
              <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
            )}
          </div>
        </div>

        {!showWaitlist && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <Select
              value={formData.paymentType}
              onValueChange={(value: "Full" | "Deposit") =>
                setFormData({ ...formData, paymentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full">Full Payment</SelectItem>
                <SelectItem value="Deposit">Deposit (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <Textarea
            value={formData.specialRequests}
            onChange={(e) =>
              setFormData({ ...formData, specialRequests: e.target.value })
            }
            rows={3}
            placeholder="Any special requests or requirements..."
          />
        </div>

        {/* Price Summary */}
        {!showWaitlist && priceDetails && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">
                ${basePrice.toFixed(2)} per person
              </span>
            </div>
            {priceDetails.adjustments.map((adjustment: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{adjustment.reason}:</span>
                <span
                  className={`font-medium ${adjustment.type === "seasonal" && adjustment.multiplier > 1 ? "text-red-600" : "text-green-600"}`}
                >
                  {adjustment.multiplier > 1 ? "+" : ""}
                  {((adjustment.multiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total Price:</span>
                <span className="font-bold text-lg">
                  ${priceDetails.totalFinalPrice.toFixed(2)}
                </span>
              </div>
              {formData.paymentType === "Deposit" && (
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Deposit Required (30%):</span>
                  <span>
                    ${(priceDetails.totalFinalPrice * 0.3).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Status */}
        {loading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-sm text-gray-500">
              Checking availability...
            </span>
          </div>
        )}

        {availability && !loading && (
          <div
            className={`p-3 rounded-lg ${availability.available ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center gap-2">
              {availability.available ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${availability.available ? "text-green-900" : "text-red-900"}`}
              >
                {availability.available
                  ? `${availability.availableSlots} spots available`
                  : availability.reason}
              </span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={
            submitting ||
            loading ||
            (availability && !availability.available && !showWaitlist)
          }
        >
          {submitting
            ? "Submitting..."
            : showWaitlist
              ? "Join Waitlist"
              : "Submit Booking"}
        </Button>

        {!showWaitlist && availability && !availability.available && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowWaitlist(true)}
          >
            Join Waitlist Instead
          </Button>
        )}
      </form>
    </div>
  );
}
