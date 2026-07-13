"use client";

import { useState, useEffect } from "react";
import { getTourById } from "@/actions/tourActions";
import { updateTour } from "@/actions/tourActions";
import { tourSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditExpeditionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tour, setTour] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadTour() {
      const { id } = await params;
      const data = await getTourById(id);
      if (!data) {
        notFound();
      }
      setTour(data);
      setImageUrl(data.image);
      setIsLoading(false);
    }
    loadTour();
  }, [params]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      // Extract form data
      const data = {
        title: formData.get("title") as string,
        location: formData.get("location") as string,
        duration: formData.get("duration") as string,
        price: formData.get("price") as string,
        category: formData.get("category") as string,
        image: imageUrl,
        description: formData.get("description") as string,
        rating: parseFloat(formData.get("rating") as string) || 5.0,
      };

      // Validate with Zod
      const validationResult = tourSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      const { id } = await params;
      await updateTour(id, formData);
      router.push(`/dashboard/admin/expeditions/${id}`);
    } catch (error) {
      console.error("Error updating expedition:", error);
      alert("Failed to update expedition. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/expeditions/${tour.id}`}>
          <Button variant="ghost" size="sm" className="text-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Edit Expedition
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Update expedition information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
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
                defaultValue={tour.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all text-black"
                placeholder="e.g., Gorilla Trekking Adventure"
              />
            </div>

            {/* Location */}
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
                defaultValue={tour.location}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all text-black"
                placeholder="e.g., Volcanoes National Park"
              />
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                required
                defaultValue={tour.duration}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all text-black"
                placeholder="e.g., 3 Days 2 Nights"
              />
            </div>

            {/* Price */}
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
                defaultValue={tour.price}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all text-black"
                placeholder="e.g., $2,500 / person"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue={tour.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all bg-white text-black"
              >
                <option value="">Select category</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Safari">Safari</option>
                <option value="Culture">Culture</option>
                <option value="Relaxation">Relaxation</option>
              </select>
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <FileUpload
                label="Image *"
                fileType="image"
                subfolder="expeditions"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxSize={4 * 1024 * 1024}
                required
              />
            </div>

            {/* Rating */}
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Rating
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="1"
                max="5"
                step="0.1"
                defaultValue={tour.rating}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all text-black"
              />
            </div>

            {/* Description */}
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
                defaultValue={tour.description}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none transition-all resize-none text-black"
                placeholder="Describe the expedition experience..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/expeditions/${tour.id}`}>
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
