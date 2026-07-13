"use client";

import { useState, useEffect } from "react";
import { getGalleryImageById } from "@/actions/galleryActions";
import { updateGalleryImage } from "@/actions/galleryActions";
import { gallerySchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [imageData, setImageData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadImage() {
      const { id } = await params;
      const data = await getGalleryImageById(id);
      if (!data) {
        notFound();
      }
      setImageData(data);
      setImageUrl(data.image);
      setIsLoading(false);
    }
    loadImage();
  }, [params]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      const data = {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        image: imageUrl,
        className: formData.get("className") as string,
      };

      const validationResult = gallerySchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      const { id } = await params;
      await updateGalleryImage(id, formData);
      router.push(`/dashboard/admin/gallery/${id}`);
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/gallery/${imageData.id}`}>
          <Button variant="ghost" size="sm" className="text-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Edit Image
          </h1>
          <p className="text-sm text-gray-500 mt-2">Update image information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={imageData.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., Silverback Gorilla"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                defaultValue={imageData.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., Wildlife"
              />
            </div>

            <div>
              <label
                htmlFor="className"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Layout Size *
              </label>
              <select
                id="className"
                name="className"
                required
                defaultValue={imageData.className}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select layout</option>
                <option value="md:col-span-1 md:row-span-1">Small (1x1)</option>
                <option value="md:col-span-2 md:row-span-2">Large (2x2)</option>
                <option value="md:col-span-1 md:row-span-2">Tall (1x2)</option>
                <option value="md:col-span-2 md:row-span-1">Wide (2x1)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <FileUpload
                label="Image *"
                fileType="image"
                subfolder="gallery"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxSize={4 * 1024 * 1024}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/gallery/${imageData.id}`}>
              <Button variant="outline" className="text-black">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="bg-linear-to-r from-[#d4af37] to-[#f1d592] hover:opacity-90 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
