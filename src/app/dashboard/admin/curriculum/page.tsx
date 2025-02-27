"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { School, Users, BookOpen, PlusCircle, Trash } from "lucide-react";

export default function AdminClassesPage() {
  const [currentTab, setCurrentTab] = useState<"classes" | "subjects">("classes");

  // Data states
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New class & subject form state
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // Dialog states
  const [createClassDialogOpen, setCreateClassDialogOpen] = useState(false);
  const [createSubjectDialogOpen, setCreateSubjectDialogOpen] = useState(false);
  const [assignSubjectDialogOpen, setAssignSubjectDialogOpen] = useState(false);
  const [assignStudentDialogOpen, setAssignStudentDialogOpen] = useState(false);
  const [assignTeacherDialogOpen, setAssignTeacherDialogOpen] = useState(false);

  // For assignment dialogs, store the selected class or subject
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubjectForTeacher, setSelectedSubjectForTeacher] = useState<any>(null);

  // For assignment dialogs, store selected IDs
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Helper: Given an array of teacher IDs, return their full names
  const getTeacherNames = (teacherIds: string[]) => {
    if (!teacherIds || teacherIds.length === 0) return "Unassigned";
    return teacherIds
      .map((id) => {
        const teacher = teachers.find((t) => t.id === id);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";
      })
      .join(", ");
  };

  useEffect(() => {
    async function fetchData() {
      const authToken = localStorage.getItem("authToken");
      try {
        const [classesRes, subjectsRes, unassignedRes, teachersRes] = await Promise.all([
          fetch("http://localhost:4000/api/class/classes", { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch("http://localhost:4000/api/class/subjects", { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch("http://localhost:4000/api/class/student/unassigned", { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch("http://localhost:4000/api/auth/users?role=teacher", { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        if (!classesRes.ok) throw new Error("Failed to fetch classes");
        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
        if (!unassignedRes.ok) throw new Error("Failed to fetch unassigned students");
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");

        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const unassignedData = await unassignedRes.json();
        const teachersData = await teachersRes.json();

        console.log(subjectsData);

        setClasses(classesData);
        setSubjects(subjectsData);
        setUnassignedStudents(unassignedData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch("http://localhost:4000/api/class/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ name: newClassName, subjectIds: [], studentIds: [] }),
      });

      if (!res.ok) throw new Error("Failed to create class");

      const createdClass = await res.json();
      setClasses((prev) => [...prev, createdClass]);
      setNewClassName("");
      setCreateClassDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch("http://localhost:4000/api/class/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ name: newSubjectName, teacherIds: [] }),
      });

      if (!res.ok) throw new Error("Failed to create subject");

      const createdSubject = await res.json();
      setSubjects((prev) => [...prev, createdSubject]);
      setNewSubjectName("");
      setCreateSubjectDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignSubjectToClass = async () => {
    if (!selectedClass || !selectedSubjectId) return;
    const authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch(`http://localhost:4000/api/class/classes/${selectedClass.id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ subjectId: selectedSubjectId }),
      });

      if (!res.ok) throw new Error("Failed to assign subject to class");

      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === selectedClass.id
            ? {
                ...cls,
                subjects: [...(cls.subjects || []), subjects.find(s => s.id === selectedSubjectId)],
              }
            : cls
        )
      );

      setAssignSubjectDialogOpen(false);
      setSelectedSubjectId("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignStudentToClass = async () => {
    if (!selectedClass || !selectedStudentId) return;
    const authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch(`http://localhost:4000/api/class/classes/${selectedClass.id}/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      if (!res.ok) throw new Error("Failed to assign student to class");

      const student = unassignedStudents.find((s) => s.id === selectedStudentId);

      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === selectedClass.id
            ? { ...cls, students: [...(cls.students || []), student] }
            : cls
        )
      );

      setUnassignedStudents((prev) => prev.filter((s) => s.id !== selectedStudentId));
      setAssignStudentDialogOpen(false);
      setSelectedStudentId("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignTeacherToSubject = async () => {
    if (!selectedSubjectForTeacher || !selectedTeacherId) return;
    const authToken = localStorage.getItem("authToken");

    try {
      const res = await fetch(`http://localhost:4000/api/class/subjects/${selectedSubjectForTeacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ teacherIds: [selectedTeacherId] }),
      });

      if (!res.ok) throw new Error("Failed to assign teacher to subject");

      // Optionally update local subject data here if needed
      setAssignTeacherDialogOpen(false);
      setSelectedTeacherId("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const authToken = localStorage.getItem("authToken");
    try {
      const res = await fetch(`http://localhost:4000/api/class/classes/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete class");

      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    const authToken = localStorage.getItem("authToken");
    try {
      const res = await fetch(`http://localhost:4000/api/class/subjects/${subjectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete subject");

      setSubjects((prev) => prev.filter((subj) => subj.id !== subjectId));
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <School className="h-6 w-6" />
          Curriculum Management
        </h1>
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
          <TabsList>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subjects
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {currentTab === "classes" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={createClassDialogOpen} onOpenChange={setCreateClassDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  New Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>Enter the class name below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Grade 10-A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateClassDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {classes.map((cls) => (
              <Card key={cls.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{cls.name}</span>
                    <Badge variant="secondary">
                      {cls.studentIds?.length || 0} student(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {cls.subjects?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {cls.subjects.map((sub: any) => (
                          <Badge key={sub.id} variant="outline">
                            {sub.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-end border-t pt-3">
                  <Dialog open={assignSubjectDialogOpen} onOpenChange={setAssignSubjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Subject to {cls.name}</DialogTitle>
                        <DialogDescription>Select a subject from the list</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects
                              .filter(
                                (subj) =>
                                  !(selectedClass?.subjects || []).some(
                                    (assignedSubj) => assignedSubj.id === subj.id
                                  )
                              )
                              .map((subj) => (
                                <SelectItem key={subj.id} value={subj.id}>
                                  <Label>{subj.name}</Label>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAssignSubjectDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAssignSubjectToClass}>Add Subject</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={assignStudentDialogOpen} onOpenChange={setAssignStudentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Student to {cls.name}</DialogTitle>
                        <DialogDescription>Select an unassigned student</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select
                          value={selectedStudentId}
                          onValueChange={setSelectedStudentId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedStudents.map((stud) => (
                              <SelectItem key={stud.id} value={stud.id}>
                                {stud.firstName} {stud.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAssignStudentDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAssignStudentToClass}>Add Student</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Delete Class Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this class?")) {
                        handleDeleteClass(cls.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={createSubjectDialogOpen} onOpenChange={setCreateSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  New Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>Enter the subject name below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      placeholder="e.g., Mathematics"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateSubjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subj) => (
              <Card key={subj.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{subj.name}</span>
                    <Badge variant="secondary">
                      {subj.teacherIds && subj.teacherIds.length > 0
                        ? getTeacherNames(subj.teacherIds)
                        : "Unassigned"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="border-t pt-3 flex gap-2 justify-end">
                  <Dialog open={assignTeacherDialogOpen} onOpenChange={setAssignTeacherDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubjectForTeacher(subj)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Assign Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Assign Teacher to {subj.name}</DialogTitle>
                        <DialogDescription>Select a qualified teacher</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select
                          value={selectedTeacherId}
                          onValueChange={setSelectedTeacherId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAssignTeacherDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAssignTeacherToSubject}>Assign</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Delete Subject Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this subject?")) {
                        handleDeleteSubject(subj.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
