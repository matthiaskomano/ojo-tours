import { getGalleryImageById } from "@/actions/galleryActions";
import { updateGalleryImage } from "@/actions/galleryActions";
import { gallerySchema } from "@/lib/validations/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditGalleryImagePage({
  params,
}: {
  params: { id: string };
}) {
  const image = await getGalleryImageById(params.id);

  if (!image) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const data = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      className: formData.get("className") as string,
    };

    const validationResult = gallerySchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.error("Validation errors:", errors);
      throw new Error("Validation failed");
    }

    await updateGalleryImage(params.id, formData);

    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/dashboard/admin/gallery/[id]");
    revalidatePath("/");

    redirect(`/dashboard/admin/gallery/${params.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/gallery/${image.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Edit Image</h1>
          <p className="text-sm text-gray-500 mt-2">Update image information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={image.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Silverback Gorilla"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                defaultValue={image.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Wildlife"
              />
            </div>

            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                Layout Size *
              </label>
              <select
                id="className"
                name="className"
                required
                defaultValue={image.className}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select layout</option>
                <option value="md:col-span-1 md:row-span-1">Small (1x1)</option>
                <option value="md:col-span-2 md:row-span-2">Large (2x2)</option>
                <option value="md:col-span-1 md:row-span-2">Tall (1x2)</option>
                <option value="md:col-span-2 md:row-span-1">Wide (2x1)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                required
                defaultValue={image.image}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/gallery/${image.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
