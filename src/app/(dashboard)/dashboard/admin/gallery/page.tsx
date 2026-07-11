import { getGalleryImages } from "@/actions/galleryActions";
import { deleteGalleryImage } from "@/actions/galleryActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Edit, Trash2, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Gallery</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your image gallery and media</p>
        </div>
        <Link href="/dashboard/admin/gallery/new">
          <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Image
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding your first image</p>
            <Link href="/dashboard/admin/gallery/new">
              <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {images.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img src={image.image} alt={image.title} className="w-20 h-20 rounded-lg object-cover" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{image.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {image.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 font-mono">{image.className}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/gallery/${image.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/gallery/${image.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteGalleryImage.bind(null, image.id)}>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
