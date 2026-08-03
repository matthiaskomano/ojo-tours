import { getSystemOverview } from "@/actions/systemHealthActions";
import {
  Activity,
  Database,
  HardDrive,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  MemoryStick,
  RefreshCw,
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
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function SystemHealthPage() {
  const systemOverview = await getSystemOverview();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-700 border-green-200";
      case "degraded":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "critical":
      case "unhealthy":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 50) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            System Health
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Monitor system performance and infrastructure status
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card className="bg-linear-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Health
          </CardTitle>
          <CardDescription>
            Last checked:{" "}
            {new Date(systemOverview.timestamp || Date.now()).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-linear-to-br from-white to-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">
                      {systemOverview.overallScore || 0}
                    </p>
                    <p className="text-xs text-gray-500">/ 100</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge
                  className={getStatusColor(
                    systemOverview.overallStatus || "unknown",
                  )}
                >
                  {systemOverview.overallStatus?.toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-gray-600">
                    {systemOverview.scores?.database || 0}/100
                  </span>
                </div>
                <Progress
                  value={systemOverview.scores?.database || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-gray-600">
                    {systemOverview.scores?.storage || 0}/100
                  </span>
                </div>
                <Progress
                  value={systemOverview.scores?.storage || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">API</span>
                  <span className="text-sm text-gray-600">
                    {systemOverview.scores?.api || 0}/100
                  </span>
                </div>
                <Progress
                  value={systemOverview.scores?.api || 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Performance</span>
                  <span className="text-sm text-gray-600">
                    {systemOverview.scores?.performance || 0}/100
                  </span>
                </div>
                <Progress
                  value={systemOverview.scores?.performance || 0}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {getStatusIcon(
              systemOverview.components?.database?.status || "unknown",
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemOverview.components?.database?.status?.toUpperCase() ||
                "UNKNOWN"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {systemOverview.components?.database?.connectionTime || 0}ms
              response
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Size</span>
                <span className="font-medium">
                  {systemOverview.components?.database?.dbSizeFormatted ||
                    "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Connections</span>
                <span className="font-medium">
                  {systemOverview.components?.database?.poolStats
                    ?.totalConnections || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            {getStatusIcon(
              systemOverview.components?.storage?.status || "unknown",
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemOverview.components?.storage?.status?.toUpperCase() ||
                "UNKNOWN"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <HardDrive className="h-3 w-3" />
              {systemOverview.components?.storage?.totalSizeFormatted ||
                "0 MB"}{" "}
              used
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Buckets</span>
                <span className="font-medium">
                  {systemOverview.components?.storage?.buckets?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Services</CardTitle>
            {getStatusIcon(systemOverview.components?.api?.status || "unknown")}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemOverview.components?.api?.status?.toUpperCase() ||
                "UNKNOWN"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Server className="h-3 w-3" />
              {
                Object.values(
                  systemOverview.components?.api?.checks || {},
                ).filter(Boolean).length
              }
              /3 services
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Database</span>
                <Badge
                  variant={
                    systemOverview.components?.api?.checks?.database
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemOverview.components?.api?.checks?.database
                    ? "OK"
                    : "Fail"}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Storage</span>
                <Badge
                  variant={
                    systemOverview.components?.api?.checks?.storage
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemOverview.components?.api?.checks?.storage
                    ? "OK"
                    : "Fail"}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Auth</span>
                <Badge
                  variant={
                    systemOverview.components?.api?.checks?.auth
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {systemOverview.components?.api?.checks?.auth ? "OK" : "Fail"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemOverview.components?.performance?.cacheHitRatioFormatted ||
                "0%"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MemoryStick className="h-3 w-3" />
              Cache hit ratio
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Slow Queries</span>
                <span className="font-medium">
                  {systemOverview.components?.performance?.slowQueries
                    ?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tables Monitored</span>
                <span className="font-medium">
                  {systemOverview.components?.performance?.tableBloat?.length ||
                    0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Details
          </CardTitle>
          <CardDescription>
            Connection pool and record statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold">
                {systemOverview.components?.database?.poolStats
                  ?.totalConnections || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold">
                {systemOverview.components?.database?.poolStats
                  ?.activeConnections || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Idle Connections</p>
              <p className="text-2xl font-bold">
                {systemOverview.components?.database?.poolStats
                  ?.idleConnections || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Database Size</p>
              <p className="text-2xl font-bold">
                {systemOverview.components?.database?.dbSizeFormatted ||
                  "Unknown"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Record Counts</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Users</span>
                <Badge variant="secondary">
                  {systemOverview.components?.database?.recordCounts?.users ||
                    0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Bookings</span>
                <Badge variant="secondary">
                  {systemOverview.components?.database?.recordCounts
                    ?.bookings || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tours</span>
                <Badge variant="secondary">
                  {systemOverview.components?.database?.recordCounts?.tours ||
                    0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Lodges</span>
                <Badge variant="secondary">
                  {systemOverview.components?.database?.recordCounts?.lodges ||
                    0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Details
          </CardTitle>
          <CardDescription>Bucket usage and file statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {systemOverview.components?.storage?.buckets &&
          systemOverview.components.storage.buckets.length > 0 ? (
            <div className="space-y-3">
              {systemOverview.components.storage.buckets.map((bucket: any) => (
                <div key={bucket.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{bucket.name}</p>
                      <p className="text-sm text-gray-500">
                        {bucket.fileCount} files
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {bucket.totalSizeFormatted || "0 MB"}
                    </Badge>
                  </div>
                  {bucket.error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {bucket.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No storage buckets found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Query performance and cache statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slow Queries */}
            <div>
              <h4 className="text-sm font-medium mb-3">Top Slow Queries</h4>
              {systemOverview.components?.performance?.slowQueries &&
              systemOverview.components.performance.slowQueries.length > 0 ? (
                <div className="space-y-2">
                  {systemOverview.components.performance.slowQueries
                    .slice(0, 5)
                    .map((query: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Query #{index + 1}
                          </span>
                          <Badge variant="outline">
                            {query.mean_time?.toFixed(2)}ms avg
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {query.query?.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>{query.calls} calls</span>
                          <span>•</span>
                          <span>{query.max_time?.toFixed(2)}ms max</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No slow queries recorded
                </p>
              )}
            </div>

            {/* Table Sizes */}
            <div>
              <h4 className="text-sm font-medium mb-3">Table Sizes</h4>
              {systemOverview.components?.performance?.tableBloat &&
              systemOverview.components.performance.tableBloat.length > 0 ? (
                <div className="space-y-2">
                  {systemOverview.components.performance.tableBloat
                    .slice(0, 5)
                    .map((table: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {table.tablename}
                          </span>
                          <Badge variant="secondary">{table.size}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Table: {table.table_size}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No table data available
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
