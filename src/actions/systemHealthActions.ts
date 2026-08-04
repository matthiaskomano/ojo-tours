"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireAnyRole, AuthorizationError } from "@/lib/authorization";
import { createClient } from "@supabase/supabase-js";

// Database health check
export async function getDatabaseHealth() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const startTime = Date.now();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const connectionTime = Date.now() - startTime;

    // Get database size (PostgreSQL specific)
    const sizeResult = await prisma.$queryRaw<Array<{ pg_database_size: string }>>`
      SELECT pg_database_size(current_database()) as pg_database_size
    `;
    const dbSize = sizeResult[0]?.pg_database_size 
      ? Math.round(parseInt(sizeResult[0].pg_database_size) / 1024 / 1024) // Convert to MB
      : 0;

    // Get connection pool stats
    const poolStats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
    };

    try {
      const poolResult = await prisma.$queryRaw<Array<{ count: number, state: string }>>`
        SELECT count(*) as count, state 
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state
      `;
      
      poolResult.forEach((row: any) => {
        const count = Number(row.count);
        poolStats.totalConnections += count;
        if (row.state === 'active') poolStats.activeConnections = count;
        if (row.state === 'idle') poolStats.idleConnections = count;
      });
    } catch (error) {
      console.error("Failed to get pool stats:", error);
    }

    // Table record counts
    const [userCount, bookingCount, tourCount, lodgeCount] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.tour.count(),
      prisma.lodge.count(),
    ]);

    return {
      status: "healthy",
      connectionTime,
      dbSize,
      dbSizeFormatted: dbSize > 1024 ? `${(dbSize / 1024).toFixed(2)} GB` : `${dbSize} MB`,
      poolStats,
      recordCounts: {
        users: userCount,
        bookings: bookingCount,
        tours: tourCount,
        lodges: lodgeCount,
      },
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Database health check failed:", error);
    return {
      status: "unhealthy",
      connectionTime: 0,
      dbSize: 0,
      dbSizeFormatted: "Unknown",
      poolStats: { totalConnections: 0, activeConnections: 0, idleConnections: 0 },
      recordCounts: { users: 0, bookings: 0, tours: 0, lodges: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Storage health check (Supabase Storage)
export async function getStorageHealth() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        status: "error",
        message: "Supabase credentials not configured",
        buckets: [],
        totalSize: 0,
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    // Get size information for each bucket
    const bucketInfo = await Promise.all(
      (buckets || []).map(async (bucket) => {
        try {
          const { data: files, error: filesError } = await supabase
            .storage
            .from(bucket.name)
            .list('', { limit: 1000 });

          if (filesError) {
            return {
              name: bucket.name,
              fileCount: 0,
              totalSize: 0,
              error: filesError.message,
            };
          }

          const fileCount = files?.length || 0;
          // Note: Supabase doesn't provide direct size info, this is estimated
          const estimatedSize = fileCount * 1024 * 1024; // Assume 1MB per file average

          return {
            name: bucket.name,
            fileCount,
            totalSize: estimatedSize,
            totalSizeFormatted: `${(estimatedSize / 1024 / 1024).toFixed(2)} MB`,
          };
        } catch (error) {
          return {
            name: bucket.name,
            fileCount: 0,
            totalSize: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const totalSize = bucketInfo.reduce((sum, bucket) => sum + bucket.totalSize, 0);

    return {
      status: "healthy",
      buckets: bucketInfo,
      totalSize,
      totalSizeFormatted: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Storage health check failed:", error);
    return {
      status: "unhealthy",
      buckets: [],
      totalSize: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// API health check
export async function getAPIHealth() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const checks = {
      database: false,
      storage: false,
      auth: false,
    };

    const errors: Record<string, string> = {};

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      errors.database = error instanceof Error ? error.message : "Unknown error";
    }

    // Check storage
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.storage.listBuckets();
        checks.storage = true;
      }
    } catch (error) {
      errors.storage = error instanceof Error ? error.message : "Unknown error";
    }

    // Check auth
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.getSession();
        checks.auth = true;
      }
    } catch (error) {
      errors.auth = error instanceof Error ? error.message : "Unknown error";
    }

    const allHealthy = Object.values(checks).every(Boolean);

    return {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      errors,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("API health check failed:", error);
    return {
      status: "unhealthy",
      checks: { database: false, storage: false, auth: false },
      errors: { general: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
    };
  }
}

// Performance metrics
export async function getPerformanceMetrics() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    // Recent slow queries (PostgreSQL pg_stat_statements)
    let slowQueries: any[] = [];
    try {
      const slowQueryResult = await prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_exec_time as total_time,
          mean_exec_time as mean_time,
          max_exec_time as max_time
        FROM pg_stat_statements
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `;
      slowQueries = slowQueryResult as any[];
    } catch (error) {
      console.error("Failed to get slow queries:", error);
    }

    // Cache hit ratio
    let cacheHitRatio = 0;
    try {
      const cacheResult = await prisma.$queryRaw<Array<{ ratio: number }>>`
        SELECT 
          sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0) as ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `;
      cacheHitRatio = cacheResult[0]?.ratio ? parseFloat(cacheResult[0].ratio.toString()) * 100 : 0;
    } catch (error) {
      console.error("Failed to get cache hit ratio:", error);
    }

    // Table bloat analysis
    let tableBloat: any[] = [];
    try {
      const bloatResult = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('journal', '_prisma_migrations')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `;
      tableBloat = bloatResult as any[];
    } catch (error) {
      console.error("Failed to get table bloat:", error);
    }

    return {
      slowQueries: slowQueries.slice(0, 5),
      cacheHitRatio: cacheHitRatio.toFixed(2),
      cacheHitRatioFormatted: `${cacheHitRatio.toFixed(2)}%`,
      tableBloat: tableBloat.slice(0, 5),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch performance metrics:", error);
    return {
      slowQueries: [],
      cacheHitRatio: "0",
      cacheHitRatioFormatted: "0%",
      tableBloat: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// System overview
export async function getSystemOverview() {
  noStore();
  try {
    await requireAnyRole(["ADMIN", "SUPER_ADMIN"]);

    const [dbHealth, storageHealth, apiHealth, performance] = await Promise.all([
      getDatabaseHealth(),
      getStorageHealth(),
      getAPIHealth(),
      getPerformanceMetrics(),
    ]);

    // Calculate overall health score
    const scores = {
      database: dbHealth.status === "healthy" ? 100 : 0,
      storage: storageHealth.status === "healthy" ? 100 : 0,
      api: apiHealth.status === "healthy" ? 100 : apiHealth.status === "degraded" ? 50 : 0,
      performance: parseFloat(performance.cacheHitRatio) > 90 ? 100 : parseFloat(performance.cacheHitRatio) > 70 ? 70 : 50,
    };

    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
    );

    return {
      overallScore,
      overallStatus: overallScore >= 80 ? "healthy" : overallScore >= 50 ? "degraded" : "critical",
      components: {
        database: dbHealth,
        storage: storageHealth,
        api: apiHealth,
        performance,
      },
      scores,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get system overview:", error);
    return {
      overallScore: 0,
      overallStatus: "critical",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
