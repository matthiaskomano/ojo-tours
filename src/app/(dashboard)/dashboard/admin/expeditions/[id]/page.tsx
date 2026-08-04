import { getTourById } from "@/actions/tourActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  MapPin as MapIcon,
  Clock,
  DollarSign,
  Star,
  Users,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default async function ExpeditionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTourById(id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/expeditions">
          <Button
            variant="ghost"
            size="sm"
            className="text-black cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {tour.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Expedition details and information
          </p>
        </div>
        <Link href={`/dashboard/admin/expeditions/${tour.id}/edit`}>
          <Button className="bg-linear-to-r from-[#d4af37] to-[#f1d592] hover:opacity-90 text-white">
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
            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {tour.description}
            </p>
          </div>

          {/* Itinerary */}
          {tour.itinerary && Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Daily Itinerary
              </h2>
              <div className="space-y-4">
                {tour.itinerary.map((day: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-semibold text-primary-gold uppercase tracking-wide">
                      {day.day}
                    </p>
                    <h3 className="text-lg font-medium text-gray-900 mt-1">
                      {day.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{day.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Included/Excluded */}
          {(tour.included && Array.isArray(tour.included) && tour.included.length > 0) || 
           (tour.excluded && Array.isArray(tour.excluded) && tour.excluded.length > 0) ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.included && Array.isArray(tour.included) && tour.included.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                      What's Included
                    </h2>
                    <ul className="space-y-2">
                      {tour.included.map((item: string, idx: number) => (
                        <li key={idx} className="text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.excluded && Array.isArray(tour.excluded) && tour.excluded.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <XCircle className="mr-2 h-5 w-5 text-red-400" />
                      Not Included
                    </h2>
                    <ul className="space-y-2">
                      {tour.excluded.map((item: string, idx: number) => (
                        <li key={idx} className="text-gray-600 flex items-start">
                          <span className="text-red-400 mr-2">✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Gallery */}
          {tour.gallery && Array.isArray(tour.gallery) && tour.gallery.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tour.gallery.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={img}
                      alt={`Gallery image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {tour.faqs && Array.isArray(tour.faqs) && tour.faqs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {tour.faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              {tour.groupSize && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="font-medium text-gray-900">{tour.groupSize}</p>
                  </div>
                </div>
              )}
              {tour.difficulty && (
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    <p className="font-medium text-gray-900">{tour.difficulty}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Category</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-gold/10 text-primary-gold">
              {tour.category}
            </span>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">
                  {new Date(tour.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">
                  {new Date(tour.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
