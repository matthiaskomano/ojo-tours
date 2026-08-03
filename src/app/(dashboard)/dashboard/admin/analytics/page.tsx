import {
  getEnhancedRevenueStats,
  getCustomerAnalytics,
  getContentPerformanceAnalytics,
  getPredictiveAnalytics,
} from "@/actions/enhancedAnalyticsActions";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Home,
  Star,
  Activity,
  ArrowUp,
  ArrowDown,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCardSkeleton } from "@/components/ui/skeleton-loaders";
import { ChartSkeleton } from "@/components/ui/skeleton-loaders";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function AnalyticsContent({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (searchParams.period as "7d" | "30d" | "90d" | "1y") || "30d";

  const [revenueStats, customerStats, contentStats, predictiveStats] =
    await Promise.all([
      getEnhancedRevenueStats({ period }),
      getCustomerAnalytics(),
      getContentPerformanceAnalytics(),
      getPredictiveAnalytics(),
    ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Enhanced Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Advanced insights and performance metrics
          </p>
        </div>

        <Select name="period" defaultValue={period}>
          <SelectTrigger className="w-full md:w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(revenueStats.avgDailyRevenue)}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueStats.growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {revenueStats.growthRate >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueStats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              During selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueStats.totalBookings > 0
                ? formatCurrency(
                    revenueStats.totalRevenue / revenueStats.totalBookings,
                  )
                : "$0"}
            </div>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Daily revenue over selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {revenueStats.revenueTrend.map((data, index) => {
              const maxValue = Math.max(
                ...revenueStats.revenueTrend.map((d) => d.revenue),
                1,
              );
              const height = (data.revenue / maxValue) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-linear-to-t from-[#d4af37] to-[#d3b673] rounded-t-sm transition-all hover:opacity-80 relative group"
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(data.revenue)}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {new Date(data.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Analytics
            </CardTitle>
            <CardDescription>
              User engagement and conversion metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{customerStats.totalUsers}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">With Bookings</p>
                <p className="text-2xl font-bold">
                  {customerStats.usersWithBookings}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {customerStats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customerStats.avgCustomerValue)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Customer Segments</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New (1 booking)</span>
                  <Badge variant="secondary">
                    {customerStats.segments.new}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Occasional (2-5)
                  </span>
                  <Badge variant="secondary">
                    {customerStats.segments.occasional}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regular (6-10)</span>
                  <Badge variant="secondary">
                    {customerStats.segments.regular}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Loyal (10+)</span>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {customerStats.segments.loyal}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Top Customers</h4>
              <div className="space-y-2">
                {customerStats.topCustomers.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.totalBookings} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Content Performance
            </CardTitle>
            <CardDescription>
              Top performing tours and properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Top Tours
              </h4>
              <div className="space-y-2">
                {contentStats.topTours.slice(0, 5).map((tour) => (
                  <div
                    key={tour.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{tour.title}</p>
                      <p className="text-xs text-gray-500">{tour.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(tour.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tour.bookings} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Top Properties
              </h4>
              <div className="space-y-2">
                {contentStats.topLodges.slice(0, 5).map((lodge) => (
                  <div
                    key={lodge.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{lodge.name}</p>
                      <p className="text-xs text-gray-500">{lodge.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(lodge.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lodge.bookings} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Popular Categories</h4>
              <div className="flex flex-wrap gap-2">
                {contentStats.popularCategories.map((cat) => (
                  <Badge key={cat.category} variant="outline">
                    {cat.category} ({cat._count.id})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>AI-powered insights and forecasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Predicted Bookings (Next Month)
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {predictiveStats.predictedNextMonth}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on {predictiveStats.avgWeeklyBookings.toFixed(1)} avg
                weekly bookings
              </p>
            </div>

            <div className="p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Peak Season</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {predictiveStats.peakSeason?.month || "N/A"}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {predictiveStats.peakSeason?.bookings || 0} bookings
              </p>
            </div>

            <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">
                Recent Trend
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {predictiveStats.totalRecentBookings}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Bookings in last 90 days
              </p>
            </div>
          </div>

          {predictiveStats.weeklyTrend.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Weekly Booking Trend</h4>
              <div className="h-32 flex items-end gap-1">
                {predictiveStats.weeklyTrend.map((data, index) => {
                  const maxValue = Math.max(
                    ...predictiveStats.weeklyTrend.map((d) => d.count),
                    1,
                  );
                  const height = (data.count / maxValue) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-linear-to-t from-purple-500 to-purple-300 rounded-t-sm transition-all hover:opacity-80 relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count} bookings
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.week}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Payment Type Breakdown
          </CardTitle>
          <CardDescription>
            Revenue distribution by payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(revenueStats.paymentBreakdown).map(
              ([type, amount]) => {
                const percentage =
                  revenueStats.totalRevenue > 0
                    ? (amount / revenueStats.totalRevenue) * 100
                    : 0;
                return (
                  <div key={type} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{type}</span>
                      <Badge variant="secondary">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(amount)}
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#d4af37] to-[#d3b673]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsContent searchParams={searchParams} />
    </Suspense>
  );
}

function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="h-10 w-45 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-56 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-56 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded-lg" />
              <div className="h-12 bg-muted rounded-lg" />
              <div className="h-12 bg-muted rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
