"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarDays, Pencil, PlusCircle } from "lucide-react";
import { Assignment, Subject } from "@/lib/types";

export default function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    subjectId: "",
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["teacherAssignments"],
    queryFn: async () => {
      const res = await api.get<Assignment[]>("/api/submission/assignments/my-assignments");
      return res.data || [];
    },
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["teacherSubjects"],
    queryFn: async () => {
      const res = await api.get<Subject[]>("/api/class/subjects");
      return res.data || [];
    },
  });

  const subjectsMap = useMemo(() => {
    const map = new Map<string, string>();
    subjectsData?.forEach((subject) => {
      map.set(subject.id, subject.name);
    });
    return map;
  }, [subjectsData]);

  const filteredAssignments =
    assignmentsData?.filter((assignment) =>
      selectedSubject === "all" ? true : assignment.subjectId === selectedSubject
    ) || [];

  // Mutation to update an assignment (for editing)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const payload = { ...data, dueDate: new Date(data.dueDate).toISOString() };
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/submission/assignments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update assignment");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assignment updated" });
      queryClient.invalidateQueries({ queryKey: ["teacherAssignments"] });
      setEditingAssignment(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    },
  });

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      dueDate: new Date(assignment.dueDate).toISOString().substring(0, 16), // YYYY-MM-DDTHH:mm
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data: formData });
    }
  };

  // Mutation to create a new assignment
  const createMutation = useMutation({
    mutationFn: async (newAssignment: typeof createFormData) => {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/submission/assignments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAssignment,
          dueDate: new Date(newAssignment.dueDate).toISOString(),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assignment created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["teacherAssignments"] });
      setCreateDialogOpen(false);
      setCreateFormData({
        title: "",
        description: "",
        dueDate: "",
        subjectId: "",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: error.message,
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createFormData);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Create Assignment Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Assignments</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusCircle size={18} className="mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  value={createFormData.title}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-description">Description</Label>
                <Input
                  id="create-description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="create-dueDate">Due Date</Label>
                <Input
                  id="create-dueDate"
                  type="datetime-local"
                  value={createFormData.dueDate}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, dueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-subject">Subject</Label><br></br>
                <select
                  id="create-subject"
                  value={createFormData.subjectId}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, subjectId: e.target.value })
                  }
                  required
                  className="p-2 border rounded"
                >
                  <option value="">Select a subject</option>
                  {subjectsData?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="subjectFilter">Filter by Subject:</Label>
        <select
          id="subjectFilter"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 border rounded"
          disabled={subjectsLoading}
        >
          <option value="all">All Subjects</option>
          {subjectsData?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {assignmentsLoading ? (
        <p>Loading assignments...</p>
      ) : filteredAssignments.length === 0 ? (
        <p>No assignments found for selected subject.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAssignments.map((assignment) => {
            const subjectName = subjectsMap.get(assignment.subjectId) || "Unknown Subject";
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow group border-border">
                <CardHeader className="flex flex-row justify-between items-start p-4 pb-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium">
                        {subjectName}
                      </span>
                      <CardTitle className="text-lg font-semibold">
                        {assignment.title}
                      </CardTitle>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-70 group-hover:opacity-100 transition-opacity ml-2"
                    onClick={() => openEditDialog(assignment)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border p-3 rounded-lg">
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        Submissions
                      </h4>
                      <p className="text-xl font-semibold">
                        {assignment.submissionsCount}
                      </p>
                    </div>
                    <div
                      className={`border p-3 rounded-lg ${
                        assignment.ungradedCount > 0
                          ? "border-destructive/20 bg-destructive/10"
                          : "border-success/20 bg-success/10"
                      }`}
                    >
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        Ungraded
                      </h4>
                      <p className="text-xl font-semibold">
                        {assignment.ungradedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Assignment Dialog */}
      {editingAssignment && (
        <Dialog open={true} onOpenChange={() => setEditingAssignment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
