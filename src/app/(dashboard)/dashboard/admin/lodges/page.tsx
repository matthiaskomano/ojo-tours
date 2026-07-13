import { getLodges } from "@/actions/lodgeActions";
import { deleteLodge } from "@/actions/lodgeActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin as MapIcon,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Home,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LodgesPage() {
  const lodges = await getLodges();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Properties
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your luxury lodges and accommodations
          </p>
        </div>
        <Link href="/dashboard/admin/lodges/new">
          <Button className="bg-linear-to-r from-[#f5c77e] to-[#e8b45a] hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Property
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {lodges.length === 0 ? (
          <div className="text-center py-16">
            <Home className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your first property
            </p>
            <Link href="/dashboard/admin/lodges/new">
              <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amenities
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lodges.map((lodge) => (
                  <tr
                    key={lodge.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={lodge.image}
                          alt={lodge.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {lodge.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {lodge.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {lodge.price}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lodge.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
                          >
                            {amenity}
                          </span>
                        ))}
                        {lodge.amenities.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            +{lodge.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-black">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/lodges/${lodge.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/lodges/${lodge.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteLodge.bind(null, lodge.id)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
