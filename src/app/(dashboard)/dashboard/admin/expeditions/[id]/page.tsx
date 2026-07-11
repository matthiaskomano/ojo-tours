import { getTourById } from "@/actions/tourActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin as MapIcon, Clock, DollarSign, Star } from "lucide-react";

export default async function ExpeditionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tour = await getTourById(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/expeditions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{tour.title}</h1>
          <p className="text-sm text-gray-500 mt-2">Expedition details and information</p>
        </div>
        <Link href={`/dashboard/admin/expeditions/${tour.id}/edit`}>
          <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
            <Edit className="mr-2 h-4 w-4" />
            Edit Expedition
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img src={tour.image} alt={tour.title} className="w-full h-80 object-cover" />
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{tour.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{tour.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{tour.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-gray-900">{tour.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium text-gray-900">{tour.rating}/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Category</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              {tour.category}
            </span>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{new Date(tour.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">{new Date(tour.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
