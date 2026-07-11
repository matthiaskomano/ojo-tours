import { getTeamMemberById } from "@/actions/teamActions";
import { updateTeamMember } from "@/actions/teamActions";
import { teamSchema } from "@/lib/validations/content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default async function EditTeamMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await getTeamMemberById(params.id);

  if (!member) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const data = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      image: formData.get("image") as string,
      bio: formData.get("bio") as string,
    };

    const validationResult = teamSchema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.error("Validation errors:", errors);
      throw new Error("Validation failed");
    }

    await updateTeamMember(params.id, formData);

    revalidatePath("/dashboard/admin/team");
    revalidatePath("/dashboard/admin/team/[id]");
    revalidatePath("/about");

    redirect(`/dashboard/admin/team/${params.id}`);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/team/${member.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Edit Team Member</h1>
          <p className="text-sm text-gray-500 mt-2">Update team member information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={member.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                required
                defaultValue={member.role}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Lead Guide"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                required
                defaultValue={member.image}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                id="bio"
                name="bio"
                required
                rows={6}
                defaultValue={member.bio}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about this team member..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href={`/dashboard/admin/team/${member.id}`}>
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
