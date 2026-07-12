"use client";

import { useState, useEffect } from "react";
import { getJournalById } from "@/actions/journalActions";
import { updateJournal } from "@/actions/journalActions";
import { journalSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [journal, setJournal] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadJournal() {
      const { id } = await params;
      const data = await getJournalById(id);
      if (!data) {
        notFound();
      }
      setJournal(data);
      setImageUrl(data.image);
      setIsLoading(false);
    }
    loadJournal();
  }, [params]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      const data = {
        title: formData.get("title") as string,
        category: formData.get("category") as string,
        author: formData.get("author") as string,
        readTime: formData.get("readTime") as string,
        image: imageUrl,
        excerpt: formData.get("excerpt") as string,
        featured: formData.get("featured") === "on",
      };

      const validationResult = journalSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      const { id } = await params;
      await updateJournal(id, formData);
      router.push(`/dashboard/admin/journals/${id}`);
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article. Please try again.");
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
        <Link href={`/dashboard/admin/journals/${journal.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Edit Article
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Update article information
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
                defaultValue={journal.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                defaultValue={journal.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                defaultValue={journal.author}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                defaultValue={journal.readTime}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., 5 min read"
              />
            </div>

            <div className="md:col-span-2">
              <FileUpload
                label="Image *"
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
                rows={6}
                defaultValue={journal.excerpt}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Write a brief summary of the article..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={journal.featured}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured article
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/journals/${journal.id}`}>
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
