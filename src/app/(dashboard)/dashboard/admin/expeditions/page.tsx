import { getTours } from "@/actions/tourActions";
import { deleteTour } from "@/actions/tourActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin as MapIcon,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpeditionsPage() {
  const tours = await getTours();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Expeditions
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your tour expeditions and safari packages
          </p>
        </div>
        <Link href="/dashboard/admin/expeditions/new">
          <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Expedition
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {tours.length === 0 ? (
          <div className="text-center py-16">
            <MapIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No expeditions found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your first expedition
            </p>
            <Link href="/dashboard/admin/expeditions/new">
              <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Expedition
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expedition
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {tour.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {tour.rating}/5
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {tour.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/expeditions/${tour.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/admin/expeditions/${tour.id}/edit`}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteTour.bind(null, tour.id)}>
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
