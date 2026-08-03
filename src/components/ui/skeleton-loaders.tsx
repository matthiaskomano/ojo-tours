"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Table Skeleton Loader
 * Used for data tables with rows and columns
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 px-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-24" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 px-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={`h-10 ${colIndex === 0 ? "w-12" : colIndex === 1 ? "w-32" : "w-24"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Stats Card Skeleton Loader
 * Used for dashboard statistics cards
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

/**
 * Card Grid Skeleton Loader
 * Used for card grids (tours, lodges, gallery items)
 */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Form Skeleton Loader
 * Used for forms with input fields
 */
export function FormSkeleton({ fieldCount = 4 }: { fieldCount?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/**
 * Profile Skeleton Loader
 * Used for user profile pages
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Gallery Skeleton Loader
 * Used for image galleries
 */
export function GallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

/**
 * List Skeleton Loader
 * Used for list items (notifications, messages, etc.)
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Page Header Skeleton Loader
 * Used for page headers with title and description
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

/**
 * Chart Skeleton Loader
 * Used for chart placeholders
 */
export function ChartSkeleton({ height = "64" }: { height?: string }) {
  return (
    <div className={`h-${height} flex items-end gap-1`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
}
