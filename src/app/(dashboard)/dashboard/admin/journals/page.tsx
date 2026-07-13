import { getJournals } from "@/actions/journalActions";
import { deleteJournal } from "@/actions/journalActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Edit, Trash2, Eye, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JournalsPage() {
  const journals = await getJournals();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Editorial
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your journal articles and blog posts
          </p>
        </div>
        <Link href="/dashboard/admin/journals/new">
          <Button className="bg-linear-to-r from-[#d4af37] to-[#f1d592]  hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {journals.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by creating your first article
            </p>
            <Link href="/dashboard/admin/journals/new">
              <Button className="bg-linear-to-r from-[#d4af37] to-[#f1d592] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Read Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {journals.map((journal) => (
                  <tr
                    key={journal.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={journal.image}
                          alt={journal.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {journal.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {journal.excerpt.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {journal.author}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {journal.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {journal.readTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {journal.featured ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-black">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/journals/${journal.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/admin/journals/${journal.id}/edit`}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteJournal.bind(null, journal.id)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
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
