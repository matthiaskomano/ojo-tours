import { getGalleryImageById } from "@/actions/galleryActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Camera } from "lucide-react";

export default async function GalleryImageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const image = await getGalleryImageById(params.id);

  if (!image) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/gallery">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{image.title}</h1>
          <p className="text-sm text-gray-500 mt-2">Image details and information</p>
        </div>
        <Link href={`/dashboard/admin/gallery/${image.id}/edit`}>
          <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
            <Edit className="mr-2 h-4 w-4" />
            Edit Image
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img src={image.image} alt={image.title} className="w-full h-auto" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Image Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{image.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {image.category}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Layout</p>
                <p className="font-mono text-sm text-gray-900">{image.className}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{new Date(image.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
