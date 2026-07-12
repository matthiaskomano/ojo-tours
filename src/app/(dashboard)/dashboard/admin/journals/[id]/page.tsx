import { getJournalById } from "@/actions/journalActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, BookOpen, Star } from "lucide-react";

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journal = await getJournalById(id);

  if (!journal) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/journals">
          <Button
            variant="ghost"
            size="sm"
            className="text-black cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {journal.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Article details and information
          </p>
        </div>
        <Link href={`/dashboard/admin/journals/${journal.id}/edit`}>
          <Button className="bg-linear-to-r from-[#d4af37] to-[#d3b673]  hover:opacity-90 text-white">
            <Edit className="mr-2 h-4 w-4" />
            Edit Article
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={journal.image}
              alt={journal.title}
              className="w-full h-80 object-cover"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Excerpt</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {journal.excerpt}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Article Info
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-medium text-gray-900">{journal.author}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-gold text-white">
                  {journal.category}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Read Time</p>
                <p className="font-medium text-gray-900">{journal.readTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Featured</p>
                {journal.featured ? (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">
                  {new Date(journal.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">
                  {new Date(journal.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
