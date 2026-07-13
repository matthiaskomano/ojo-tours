"use client";

import { useState } from "react";
import { addTeamMember } from "@/actions/teamActions";
import { teamSchema } from "@/lib/validations/content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewTeamMemberPage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("image", imageUrl);

      const data = {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: imageUrl,
        bio: formData.get("bio") as string,
      };

      const validationResult = teamSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        console.error("Validation errors:", errors);
        alert("Validation failed. Please check your inputs.");
        return;
      }

      await addTeamMember(formData);
      router.push("/dashboard/admin/team");
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Failed to add member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/team">
          <Button variant="ghost" size="sm" className="text-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            New Team Member
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Add a new team member to your organization
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                placeholder="e.g., Lead Guide"
              />
            </div>

            <div className="md:col-span-2">
              <FileUpload
                label="Photo *"
                fileType="image"
                subfolder="team"
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxSize={4 * 1024 * 1024}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bio *
              </label>
              <textarea
                id="bio"
                name="bio"
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about this team member..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href="/dashboard/admin/team">
              <Button variant="outline" className="text-black">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="bg-linear-to-r from-[#d4af37] to-[#f1d592]  hover:opacity-90 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
