import { getLodgeById } from "@/actions/lodgeActions";
import { updateLodge } from "@/actions/lodgeActions";
import { lodgeSchema } from "@/lib/validations/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditLodgePage({
  params,
}: {
  params: { id: string };
}) {
  const lodge = await getLodgeById(params.id);

  if (!lodge) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const data = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      price: formData.get("price") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      amenities: formData.get("amenities") as string,
    };

    const validationResult = lodgeSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.error("Validation errors:", errors);
      throw new Error("Validation failed");
    }

    await updateLodge(params.id, formData);

    revalidatePath("/dashboard/admin/lodges");
    revalidatePath("/dashboard/admin/lodges/[id]");
    revalidatePath("/lodges");

    redirect(`/dashboard/admin/lodges/${params.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/lodges/${lodge.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Edit Property</h1>
          <p className="text-sm text-gray-500 mt-2">Update property information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                required
                defaultValue={lodge.image}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
