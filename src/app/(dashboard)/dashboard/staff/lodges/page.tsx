import { getLodges } from "@/actions/lodgeActions";
import { requireMinimumRole } from "@/lib/authorization";
import { LodgeCard } from "./LodgeCard";

export const dynamic = "force-dynamic";

export default async function StaffLodgesPage() {
  await requireMinimumRole("STAFF");
  const lodges = await getLodges();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Properties
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          View all available lodges and accommodations
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Read-Only Access
          </p>
          <p className="text-xs text-amber-700 mt-1">
            You can view properties but cannot create or modify them. Contact an
            administrator for changes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lodges.map((lodge: any) => (
          <LodgeCard key={lodge.id} lodge={lodge} />
        ))}
      </div>

      {lodges.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No properties found</p>
        </div>
      )}
    </div>
  );
}
