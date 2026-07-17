"use client";

import { useState } from "react";
import { addJournal } from "@/actions/journalActions";
import { journalSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { GalleryUpload } from "@/components/ui/gallery-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewJournalPage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);
      formData.set("content", content);
      formData.set("gallery", JSON.stringify(gallery));

      const data = {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        readTime: formData.get("readTime") as string,
        image: imageUrl,
        excerpt: formData.get("excerpt") as string,
        content: content,
        gallery: gallery,
        status: formData.get("status") as string,
        featured: formData.get("featured") === "on",
      };

      const validationResult = journalSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      await addJournal(formData);
      router.push("/dashboard/admin/journals");
    } catch (error) {
      console.error("Error adding journal:", error);
      alert("Failed to create article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/journals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            New Article
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Create a new journal article or blog post
          </p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., A Day in the Life of a Gorilla"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., Wildlife"
              />
            </div>

            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="readTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Read Time *
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., 5 min read"
              />
            </div>

            <div className="md:col-span-2">
              <FileUpload
                label="Featured Image *"
                fileType="image"
                subfolder="journals"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxSize={4 * 1024 * 1024}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                placeholder="Write a brief summary of the article..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Write your article content here..."
              />
            </div>

            <div className="md:col-span-2">
              <GalleryUpload
                value={gallery}
                onChange={setGallery}
                subfolder="journals/gallery"
                maxImages={10}
                label="Gallery Images"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  className="w-4 h-4 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured article
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href="/dashboard/admin/journals">
              <Button variant="outline" className="text-black cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="bg-linear-to-r from-[#d4af37] to-[#d3b673]  cursor-pointer hover:opacity-90 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
