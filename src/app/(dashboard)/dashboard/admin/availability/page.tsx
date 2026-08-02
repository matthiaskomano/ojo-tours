"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Trash2, Search } from "lucide-react";
import {
  setAvailability,
  bulkSetAvailability,
} from "@/actions/availabilityActions";

export default function AvailabilityManagementPage() {
  const [selectedItem, setSelectedItem] = useState("");
  const [itemType, setItemType] = useState<"Tour" | "Lodge">("Tour");
  const [selectedDate, setSelectedDate] = useState("");
  const [maxSlots, setMaxSlots] = useState(10);
  const [isAvailable, setIsAvailable] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (bulkMode && startDate && endDate) {
        const result = await bulkSetAvailability(
          selectedItem,
          itemType,
          new Date(startDate),
          new Date(endDate),
          maxSlots,
          isAvailable,
        );
        setMessage(
          result.success
            ? `Updated ${result.count} dates successfully`
            : result.error || "Failed to update availability",
        );
      } else if (selectedDate) {
        const result = await setAvailability(
          selectedItem,
          itemType,
          new Date(selectedDate),
          maxSlots,
          isAvailable,
        );
        setMessage(
          result.success
            ? "Availability updated successfully"
            : result.error || "Failed to update availability",
        );
      } else {
        setMessage("Please select a date");
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
      setMessage("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Availability Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage tour and lodge availability
          </p>
        </div>
        <Button variant="outline" onClick={() => setBulkMode(!bulkMode)}>
          {bulkMode ? "Single Date Mode" : "Bulk Update Mode"}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Type
              </label>
              <Select
                value={itemType}
                onValueChange={(value: "Tour" | "Lodge") => setItemType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tour">Tour</SelectItem>
                  <SelectItem value="Lodge">Lodge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item ID
              </label>
              <Input
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                placeholder="Enter item ID"
                required
              />
            </div>
          </div>

          {bulkMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Slots
              </label>
              <Input
                type="number"
                min="1"
                value={maxSlots}
                onChange={(e) => setMaxSlots(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <Select
                value={isAvailable ? "true" : "false"}
                onValueChange={(value) => setIsAvailable(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Updating..."
              : bulkMode
                ? "Bulk Update Availability"
                : "Update Availability"}
          </Button>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use bulk mode to set availability for date ranges</li>
          <li>• Set appropriate max slots based on your capacity</li>
          <li>• Mark dates as unavailable for maintenance or holidays</li>
          <li>
            • Changes affect both the booking form and availability calendar
          </li>
        </ul>
      </div>
    </div>
  );
}
