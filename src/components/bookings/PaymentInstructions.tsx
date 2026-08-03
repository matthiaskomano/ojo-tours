"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface PaymentInstructionsProps {
  booking: {
    totalPrice: number;
    paymentType: string;
    depositAmount?: number | null;
    remainingAmount?: number | null;
    depositPaid?: boolean;
    currency?: string;
  };
}

export default function PaymentInstructions({
  booking,
}: PaymentInstructionsProps) {
  const isDeposit = booking.paymentType === "Deposit";
  const depositRequired =
    isDeposit && booking.depositAmount && booking.depositAmount > 0;
  const remainingBalance =
    booking.remainingAmount && booking.remainingAmount > 0;

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Total Amount</span>
          <span className="font-semibold text-lg">
            ${booking.totalPrice.toFixed(2)} {booking.currency}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Payment Type</span>
          <Badge variant={isDeposit ? "outline" : "default"}>
            {booking.paymentType}
          </Badge>
        </div>

        {depositRequired && (
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">Deposit Required</span>
              </div>
              <span className="font-semibold text-amber-700">
                ${booking.depositAmount!.toFixed(2)}
              </span>
            </div>

            {remainingBalance && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    Remaining Balance
                  </span>
                </div>
                <span className="font-semibold text-blue-700">
                  ${booking.remainingAmount!.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {booking.depositPaid && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Deposit Paid</span>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-sm mb-2">Payment Instructions</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Bank Transfer: OJO Tours Bank Account</p>
            <p>• Account Number: XXXX-XXXX-XXXX</p>
            <p>• Include your Booking ID in the reference</p>
            <p>• Contact us for alternative payment methods</p>
          </div>
        </div>

        {depositRequired && !booking.depositPaid && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Payment Reminder</p>
                <p>
                  Your deposit of ${booking.depositAmount!.toFixed(2)} is
                  required to confirm your booking. Please complete the payment
                  within 48 hours to avoid cancellation.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
