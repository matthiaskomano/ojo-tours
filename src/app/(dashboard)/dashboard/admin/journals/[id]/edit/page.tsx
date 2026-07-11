import { getJournalById } from "@/actions/journalActions";
import { updateJournal } from "@/actions/journalActions";
import { journalSchema } from "@/lib/validations/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditJournalPage({
  params,
}: {
  params: { id: string };
}) {
  const journal = await getJournalById(params.id);

  if (!journal) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const data = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      author: formData.get("author") as string,
      readTime: formData.get("readTime") as string,
      image: formData.get("image") as string,
      excerpt: formData.get("excerpt") as string,
      featured: formData.get("featured") === "on",
    };

    const validationResult = journalSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.error("Validation errors:", errors);
      throw new Error("Validation failed");
    }

    await updateJournal(params.id, formData);

    revalidatePath("/dashboard/admin/journals");
    revalidatePath("/dashboard/admin/journals/[id]");
    revalidatePath("/journal");

    redirect(`/dashboard/admin/journals/${params.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/journals/${journal.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Edit Article</h1>
          <p className="text-sm text-gray-500 mt-2">Update article information</p>
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
                defaultValue={journal.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., A Day in the Life of a Gorilla"
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
                defaultValue={journal.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Wildlife"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                required
                defaultValue={journal.image}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
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
                <span className="text-sm font-medium text-gray-700">Featured article</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/journals/${journal.id}`}>
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
