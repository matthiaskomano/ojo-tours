"use client";

import { useState, useEffect } from "react";
import { getTourById } from "@/actions/tourActions";
import { updateTour } from "@/actions/tourActions";
import { tourSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
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

  // Dynamic content state
  const [itinerary, setItinerary] = useState<{ day: string; title: string; desc: string }[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);

  useEffect(() => {
    async function loadTour() {
      const { id } = await params;
      const data = await getTourById(id);
      if (!data) {
        notFound();
      }
      setTour(data);
      setImageUrl(data.image);
      
      // Load dynamic content
      setItinerary(data.itinerary || []);
      setIncluded(data.included && data.included.length > 0 ? data.included : []);
      setExcluded(data.excluded && data.excluded.length > 0 ? data.excluded : []);
      setGallery(data.gallery && data.gallery.length > 0 ? data.gallery : []);
      setFaqs(data.faqs || []);
      
      setIsLoading(false);
    }
    loadTour();
  }, [params]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      // Add dynamic content fields
      formData.set("itinerary", JSON.stringify(itinerary.filter(item => item.title && item.desc)));
      formData.set("included", JSON.stringify(included.filter(item => item && item.trim())));
      formData.set("excluded", JSON.stringify(excluded.filter(item => item && item.trim())));
      formData.set("gallery", JSON.stringify(gallery.filter(item => item && item.trim())));
      formData.set("faqs", JSON.stringify(faqs.filter(item => item.q && item.a)));

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
        groupSize: formData.get("groupSize") as string,
        difficulty: formData.get("difficulty") as string,
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

            {/* Group Size */}
            <div>
              <label
                htmlFor="groupSize"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Group Size
              </label>
              <input
                type="text"
                id="groupSize"
                name="groupSize"
                defaultValue={tour.groupSize || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., Max 6 People"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={tour.difficulty || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging</option>
                <option value="Strenuous">Strenuous</option>
              </select>
            </div>

            {/* Itinerary Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itinerary
              </label>
              {itinerary.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No itinerary days added yet.</p>
              )}
              {itinerary.map((item, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Day {index + 1}</span>
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItinerary(itinerary.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.day}
                    onChange={(e) => {
                      const newItinerary = [...itinerary];
                      newItinerary[index].day = e.target.value;
                      setItinerary(newItinerary);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="e.g., Day 1"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newItinerary = [...itinerary];
                      newItinerary[index].title = e.target.value;
                      setItinerary(newItinerary);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="Title"
                  />
                  <textarea
                    value={item.desc}
                    onChange={(e) => {
                      const newItinerary = [...itinerary];
                      newItinerary[index].desc = e.target.value;
                      setItinerary(newItinerary);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none resize-none"
                    placeholder="Description"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setItinerary([...itinerary, { day: `Day ${itinerary.length + 1}`, title: "", desc: "" }])}
                className="flex items-center gap-2 text-sm text-primary-gold hover:text-primary-gold/80 font-medium"
              >
                <Plus size={16} /> Add Day
              </button>
            </div>

            {/* Included Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              {included.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No items added yet.</p>
              )}
              {included.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newIncluded = [...included];
                      newIncluded[index] = e.target.value;
                      setIncluded(newIncluded);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="e.g., Luxury Accommodation"
                  />
                  {included.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIncluded(included.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setIncluded([...included, ""])}
                className="flex items-center gap-2 text-sm text-primary-gold hover:text-primary-gold/80 font-medium"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Excluded Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Excluded
              </label>
              {excluded.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No items added yet.</p>
              )}
              {excluded.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newExcluded = [...excluded];
                      newExcluded[index] = e.target.value;
                      setExcluded(newExcluded);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="e.g., International Flights"
                  />
                  {excluded.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setExcluded(excluded.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExcluded([...excluded, ""])}
                className="flex items-center gap-2 text-sm text-primary-gold hover:text-primary-gold/80 font-medium"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Gallery Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images (URLs)
              </label>
              {gallery.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No images added yet.</p>
              )}
              {gallery.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newGallery = [...gallery];
                      newGallery[index] = e.target.value;
                      setGallery(newGallery);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {gallery.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGallery(gallery.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGallery([...gallery, ""])}
                className="flex items-center gap-2 text-sm text-primary-gold hover:text-primary-gold/80 font-medium"
              >
                <Plus size={16} /> Add Image
              </button>
            </div>

            {/* FAQs Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequently Asked Questions
              </label>
              {faqs.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No FAQs added yet.</p>
              )}
              {faqs.map((item, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">FAQ {index + 1}</span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[index].q = e.target.value;
                      setFaqs(newFaqs);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none"
                    placeholder="Question"
                  />
                  <textarea
                    value={item.a}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[index].a = e.target.value;
                      setFaqs(newFaqs);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary-gold focus:border-transparent outline-none resize-none"
                    placeholder="Answer"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
                className="flex items-center gap-2 text-sm text-primary-gold hover:text-primary-gold/80 font-medium"
              >
                <Plus size={16} /> Add FAQ
              </button>
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
