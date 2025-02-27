"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Trash, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("student");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const authToken = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/auth/all-users", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || "Failed to update user role");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || "Failed to delete user");
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Create a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          role: newRole,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || "Failed to create user");
      }

      const createdUser = await res.json();
      setUsers((prevUsers) => [...prevUsers, createdUser]);

      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewRole("student");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Filter users by search query (case-insensitive)
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header with title and create user button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <Input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <Input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 block w-full border rounded p-1"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <select
                    value={user.role?.toLowerCase() || ""}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
