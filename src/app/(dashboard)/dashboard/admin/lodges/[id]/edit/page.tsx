"use client";

import { useState, useEffect } from "react";
import { getLodgeById } from "@/actions/lodgeActions";
import { updateLodge } from "@/actions/lodgeActions";
import { lodgeSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditLodgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [lodge, setLodge] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadLodge() {
      const { id } = await params;
      const data = await getLodgeById(id);
      if (!data) {
        notFound();
      }
      setLodge(data);
      setImageUrl(data.image);
      setIsLoading(false);
    }
    loadLodge();
  }, [params]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      const data = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        price: formData.get("price") as string,
        image: imageUrl,
        description: formData.get("description") as string,
        amenities: formData.get("amenities") as string,
      };

      const validationResult = lodgeSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      const { id } = await params;
      await updateLodge(id, formData);
      router.push(`/dashboard/admin/lodges/${id}`);
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property. Please try again.");
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
        <Link href={`/dashboard/admin/lodges/${lodge.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Edit Property
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Update property information
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Property Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={lodge.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Serengeti Luxury Lodge"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                defaultValue={lodge.location}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Northern Serengeti"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                required
                defaultValue={lodge.price}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., $850 / night"
              />
            </div>

            <div className="md:col-span-2">
              <FileUpload
                label="Image *"
                fileType="image"
                subfolder="lodges"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxSize={4 * 1024 * 1024}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="amenities"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                id="amenities"
                name="amenities"
                defaultValue={lodge.amenities.join(", ")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., WiFi, Pool, Spa, Restaurant"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                defaultValue={lodge.description}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe the property and its features..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/lodges/${lodge.id}`}>
              <Button variant="outline">Cancel</Button>
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
