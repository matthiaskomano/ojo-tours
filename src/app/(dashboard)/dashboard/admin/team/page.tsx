import { getTeam } from "@/actions/teamActions";
import { deleteTeamMember } from "@/actions/teamActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, Edit, Trash2, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Team Members</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your team and staff members</p>
        </div>
        <Link href="/dashboard/admin/team/new">
          <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Member
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {team.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding your first team member</p>
            <Link href="/dashboard/admin/team/new">
              <Button className="bg-linear-to-r from-[#da8cff] to-[#9a55ff] hover:opacity-90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/admin/team/${member.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/team/${member.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteTeamMember.bind(null, member.id)}>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
