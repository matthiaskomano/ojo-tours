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
  getAllSeasonalPricing,
  getAllGroupPricing,
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

  // Pricing rules data
  const [seasonalPricingRules, setSeasonalPricingRules] = useState<any[]>([]);
  const [groupPricingRules, setGroupPricingRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  // Fetch pricing rules on component mount and after create/delete operations
  useEffect(() => {
    fetchPricingRules();
  }, [activeTab]);

  const fetchPricingRules = async () => {
    setLoadingRules(true);
    try {
      const [seasonalResult, groupResult] = await Promise.all([
        getAllSeasonalPricing(),
        getAllGroupPricing(),
      ]);

      if (seasonalResult.success) {
        setSeasonalPricingRules(seasonalResult.data || []);
      }
      if (groupResult.success) {
        setGroupPricingRules(groupResult.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pricing rules:", error);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleDeleteSeasonal = async (id: string) => {
    const result = await handleAsync(async () => {
      return await deleteSeasonalPricing(id);
    }, "Failed to delete seasonal pricing");

    if (result && result.success) {
      toast.success("Seasonal pricing deleted successfully");
      fetchPricingRules();
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const result = await handleAsync(async () => {
      return await deleteGroupPricing(id);
    }, "Failed to delete group pricing");

    if (result && result.success) {
      toast.success("Group pricing deleted successfully");
      fetchPricingRules();
    }
  };

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
      fetchPricingRules();
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
      fetchPricingRules();
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
          className={activeTab === "seasonal" ? "text-white" : "text-black"}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Seasonal Pricing
        </Button>
        <Button
          variant={activeTab === "group" ? "default" : "outline"}
          onClick={() => setActiveTab("group")}
          className={activeTab === "group" ? "text-white" : "text-black"}
        >
          <Users className="h-4 w-4 mr-2" />
          Group Pricing
        </Button>
      </div>

      {activeTab === "seasonal" && (
        <>
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
                  <SelectTrigger className="text-black w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-black">
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
                  className="text-black"
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
                  className="text-black"
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
                  className="text-black"
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
                  className="text-black"
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
                  className="text-black"
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
        </>
      )}

      {activeTab === "seasonal" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Existing Seasonal Pricing Rules
          </h2>
          {loadingRules ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : seasonalPricingRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No seasonal pricing rules created yet
            </div>
          ) : (
            <div className="space-y-3">
              {seasonalPricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {rule.itemType} - {rule.itemId}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {rule.multiplier > 1 ? "Price Increase" : "Price Decrease"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(rule.startDate).toLocaleDateString()} -{" "}
                      {new Date(rule.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Multiplier: {rule.multiplier}x
                      {rule.reason && ` (${rule.reason})`}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSeasonal(rule.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "group" && (
        <>
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
                  <SelectTrigger className="w-full text-black">
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
                  className="text-black"
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
                  className="text-black"
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
                  className="text-black"
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
                  className="text-black"
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
        </>
      )}

      {activeTab === "group" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Existing Group Pricing Rules
          </h2>
          {loadingRules ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : groupPricingRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No group pricing rules created yet
            </div>
          ) : (
            <div className="space-y-3">
              {groupPricingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {rule.itemType} - {rule.itemId}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {rule.discountPercent}% Discount
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {rule.minGuests} - {rule.maxGuests || "unlimited"} guests
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGroup(rule.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
