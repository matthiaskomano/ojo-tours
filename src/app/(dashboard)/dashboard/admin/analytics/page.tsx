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
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type AnalyticsPeriod = "7d" | "30d" | "90d" | "1y";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

function normalizePeriod(period?: string): AnalyticsPeriod {
  if (
    period === "7d" ||
    period === "30d" ||
    period === "90d" ||
    period === "1y"
  ) {
    return period;
  }
  return "30d";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatPct(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = normalizePeriod(params?.period);

  console.info("[AdminAnalytics] render:start", {
    period,
    path: "/dashboard/admin/analytics",
  });

  const [revenueResult, customerResult, contentResult, predictiveResult] =
    await Promise.allSettled([
      getEnhancedRevenueStats({ period }),
      getCustomerAnalytics(),
      getContentPerformanceAnalytics(),
      getPredictiveAnalytics(),
    ]);

  if (revenueResult.status === "rejected") {
    console.error("[AdminAnalytics] revenue:block-error", {
      period,
      error: revenueResult.reason,
    });
  }
  if (customerResult.status === "rejected") {
    console.error("[AdminAnalytics] customer:block-error", {
      period,
      error: customerResult.reason,
    });
  }
  if (contentResult.status === "rejected") {
    console.error("[AdminAnalytics] content:block-error", {
      period,
      error: contentResult.reason,
    });
  }
  if (predictiveResult.status === "rejected") {
    console.error("[AdminAnalytics] predictive:block-error", {
      period,
      error: predictiveResult.reason,
    });
  }

  const revenueStats =
    revenueResult.status === "fulfilled"
      ? revenueResult.value
      : {
          totalRevenue: 0,
          avgDailyRevenue: 0,
          growthRate: 0,
          revenueTrend: [],
          bookingTrend: [],
          paymentBreakdown: {},
          totalBookings: 0,
        };

  const customerStats =
    customerResult.status === "fulfilled"
      ? customerResult.value
      : {
          totalUsers: 0,
          usersWithBookings: 0,
          conversionRate: 0,
          avgCustomerValue: 0,
          topCustomers: [],
          segments: { new: 0, occasional: 0, regular: 0, loyal: 0 },
        };

  const contentStats =
    contentResult.status === "fulfilled"
      ? contentResult.value
      : {
          topTours: [],
          topLodges: [],
          popularCategories: [],
        };

  const predictiveStats =
    predictiveResult.status === "fulfilled"
      ? predictiveResult.value
      : {
          weeklyTrend: [],
          avgWeeklyBookings: 0,
          predictedNextMonth: 0,
          peakSeason: null,
          totalRecentBookings: 0,
        };

  console.info("[AdminAnalytics] render:success", {
    period,
    totalRevenue: revenueStats.totalRevenue,
    totalBookings: revenueStats.totalBookings,
    totalUsers: customerStats.totalUsers,
    topTours: contentStats.topTours.length,
    topLodges: contentStats.topLodges.length,
    weeklyTrendPoints: predictiveStats.weeklyTrend.length,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Enhanced Analytics
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Advanced insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => {
            const isActive = p.value === period;
            return (
              <Link
                key={p.value}
                href={`/dashboard/admin/analytics?period=${p.value}`}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-[#d4af37] bg-[#d4af37]/10 text-[#6b4f00]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(revenueStats.totalRevenue)}
            </p>
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
            <p className="text-2xl font-bold">
              {formatPct(revenueStats.growthRate)}
            </p>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
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
            <p className="text-2xl font-bold">{revenueStats.totalBookings}</p>
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
            <p className="text-2xl font-bold">
              {revenueStats.totalBookings > 0
                ? formatCurrency(
                    revenueStats.totalRevenue / revenueStats.totalBookings,
                  )
                : "$0"}
            </p>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{customerStats.totalUsers}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">With Bookings</p>
                <p className="text-2xl font-bold">
                  {customerStats.usersWithBookings}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {formatPct(customerStats.conversionRate)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customerStats.avgCustomerValue)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Customer Segments</h4>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm text-gray-700">New (1 booking)</span>
                <Badge variant="secondary">{customerStats.segments.new}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm text-gray-700">Occasional (2-5)</span>
                <Badge variant="secondary">
                  {customerStats.segments.occasional}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm text-gray-700">Regular (6-10)</span>
                <Badge variant="secondary">
                  {customerStats.segments.regular}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm text-gray-700">Loyal (10+)</span>
                <Badge variant="secondary">
                  {customerStats.segments.loyal}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <CardContent className="space-y-5">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Top Tours
              </h4>
              <div className="space-y-2">
                {contentStats.topTours.length === 0 && (
                  <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
                    No top tour data for this period.
                  </p>
                )}
                {contentStats.topTours.slice(0, 5).map((tour) => (
                  <div
                    key={tour.id || `${tour.title}-${tour.category}`}
                    className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tour.title || "Untitled Tour"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tour.category || "Uncategorized"}
                      </p>
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
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Home className="h-4 w-4" />
                Top Properties
              </h4>
              <div className="space-y-2">
                {contentStats.topLodges.length === 0 && (
                  <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
                    No top property data for this period.
                  </p>
                )}
                {contentStats.topLodges.slice(0, 5).map((lodge) => (
                  <div
                    key={lodge.id || `${lodge.name}-${lodge.location}`}
                    className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {lodge.name || "Unnamed Property"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lodge.location || "Unknown"}
                      </p>
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>
              Model-free trend estimates from recent data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">Next Month Forecast</p>
                <p className="text-2xl font-bold text-blue-900">
                  {predictiveStats.predictedNextMonth}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm text-green-700">Peak Season</p>
                <p className="text-2xl font-bold text-green-900">
                  {predictiveStats.peakSeason?.month || "N/A"}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-sm text-amber-700">Recent 90d Bookings</p>
                <p className="text-2xl font-bold text-amber-900">
                  {predictiveStats.totalRecentBookings}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Avg weekly bookings:{" "}
              {predictiveStats.avgWeeklyBookings.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Payment Breakdown
            </CardTitle>
            <CardDescription>Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(revenueStats.paymentBreakdown).length === 0 && (
                <p className="rounded-md border border-dashed p-3 text-sm text-gray-500">
                  No payment data for this period.
                </p>
              )}
              {Object.entries(revenueStats.paymentBreakdown).map(
                ([type, amount]) => {
                  const pct =
                    revenueStats.totalRevenue > 0
                      ? ((amount / revenueStats.totalRevenue) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div key={type} className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium">{type}</p>
                        <Badge variant="secondary">{pct}%</Badge>
                      </div>
                      <p className="text-xl font-bold">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
