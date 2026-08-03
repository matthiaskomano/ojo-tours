"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Users, TrendingUp } from "lucide-react";
import {
  createSeasonalPricing,
  createGroupPricing,
  deleteSeasonalPricing,
  deleteGroupPricing,
} from "@/actions/pricingActions";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { toast } from "sonner";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default function PricingManagementPage() {
  const [activeTab, setActiveTab] = useState<"seasonal" | "group">("seasonal");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { handleError, handleAsync } = useErrorHandler({
    showToast: true,
    logToConsole: true,
  });

  // Seasonal pricing form
  const [seasonalForm, setSeasonalForm] = useState({
    itemId: "",
    itemType: "Tour" as "Tour" | "Lodge",
    startDate: "",
    endDate: "",
    multiplier: 1.0,
    reason: "",
  });

  // Group pricing form
  const [groupForm, setGroupForm] = useState({
    itemId: "",
    itemType: "Tour" as "Tour" | "Lodge",
    minGuests: 5,
    maxGuests: undefined as number | undefined,
    discountPercent: 10,
  });

  const handleSeasonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await handleAsync(async () => {
      return await createSeasonalPricing({
        itemId: seasonalForm.itemId,
        itemType: seasonalForm.itemType,
        startDate: new Date(seasonalForm.startDate),
        endDate: new Date(seasonalForm.endDate),
        multiplier: seasonalForm.multiplier,
        reason: seasonalForm.reason,
      });
    }, "Failed to create seasonal pricing");

    if (result && result.success) {
      toast.success("Seasonal pricing created successfully");
      setSeasonalForm({
        itemId: "",
        itemType: "Tour",
        startDate: "",
        endDate: "",
        multiplier: 1.0,
        reason: "",
      });
    }
    setLoading(false);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await handleAsync(async () => {
      return await createGroupPricing({
        itemId: groupForm.itemId,
        itemType: groupForm.itemType,
        minGuests: groupForm.minGuests,
        maxGuests: groupForm.maxGuests,
        discountPercent: groupForm.discountPercent,
      });
    }, "Failed to create group pricing");

    if (result && result.success) {
      toast.success("Group pricing created successfully");
      setGroupForm({
        itemId: "",
        itemType: "Tour",
        minGuests: 5,
        maxGuests: undefined,
        discountPercent: 10,
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Pricing Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Configure seasonal and group pricing rules
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "seasonal" ? "default" : "outline"}
          onClick={() => setActiveTab("seasonal")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Seasonal Pricing
        </Button>
        <Button
          variant={activeTab === "group" ? "default" : "outline"}
          onClick={() => setActiveTab("group")}
        >
          <Users className="h-4 w-4 mr-2" />
          Group Pricing
        </Button>
      </div>

      {activeTab === "seasonal" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Create Seasonal Pricing Rule
          </h2>
          <form onSubmit={handleSeasonalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <Select
                  value={seasonalForm.itemType}
                  onValueChange={(value: "Tour" | "Lodge") =>
                    setSeasonalForm({ ...seasonalForm, itemType: value })
                  }
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
                  value={seasonalForm.itemId}
                  onChange={(e) =>
                    setSeasonalForm({ ...seasonalForm, itemId: e.target.value })
                  }
                  placeholder="Enter item ID"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={seasonalForm.startDate}
                  onChange={(e) =>
                    setSeasonalForm({
                      ...seasonalForm,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={seasonalForm.endDate}
                  onChange={(e) =>
                    setSeasonalForm({
                      ...seasonalForm,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Multiplier
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={seasonalForm.multiplier}
                  onChange={(e) =>
                    setSeasonalForm({
                      ...seasonalForm,
                      multiplier: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.0 = no change, 1.2 = 20% increase, 0.8 = 20% decrease
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <Input
                  value={seasonalForm.reason}
                  onChange={(e) =>
                    setSeasonalForm({ ...seasonalForm, reason: e.target.value })
                  }
                  placeholder="e.g., Peak season, Holiday"
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Seasonal Pricing"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Create Group Pricing Rule
          </h2>
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <Select
                  value={groupForm.itemType}
                  onValueChange={(value: "Tour" | "Lodge") =>
                    setGroupForm({ ...groupForm, itemType: value })
                  }
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
                  value={groupForm.itemId}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, itemId: e.target.value })
                  }
                  placeholder="Enter item ID"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Guests
                </label>
                <Input
                  type="number"
                  min="2"
                  value={groupForm.minGuests}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      minGuests: parseInt(e.target.value) || 2,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Guests
                </label>
                <Input
                  type="number"
                  min="2"
                  value={groupForm.maxGuests || ""}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      maxGuests: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={groupForm.discountPercent}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      discountPercent: parseFloat(e.target.value) || 10,
                    })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage discount to apply
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("success")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Group Pricing"}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Pricing Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Seasonal pricing: Use multipliers greater than 1.0 for peak
            seasons, less than 1.0 for off-peak
          </li>
          <li>• Group pricing: Create tiered discounts for larger groups</li>
          <li>• Both pricing types can apply simultaneously</li>
          <li>• Pricing rules are automatically applied during booking</li>
        </ul>
      </div>
    </div>
  );
}
