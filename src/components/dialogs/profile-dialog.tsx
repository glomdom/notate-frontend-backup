"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProfileDialog() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [open, setOpen] = useState(false); // Manage dialog open state

  useEffect(() => {
    async function fetchProfile() {
      const response = await api.get<Profile>("/api/auth/me");
      if (response.error) {
        setErrorProfile(response.error);
        toast({ variant: "destructive", title: "Error", description: response.error });
      } else {
        setProfile(response.data!);
      }
      setLoadingProfile(false);
    }

    fetchProfile();
  }, [toast]);

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== repeatNewPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword,
            confirmNewPassword: repeatNewPassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password change failed");
      }

      toast({ title: "Success", description: "Password changed successfully." });

      setCurrentPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
      setShowResetForm(false);
      setOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Open profile dialog" onClick={() => setOpen(true)}>
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            View your profile information and reset your password.
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <p>Loading profile...</p>
        ) : errorProfile ? (
          <p className="text-destructive">{errorProfile}</p>
        ) : profile ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">First Name</Label>
              <p className="mt-1 text-lg font-medium">{profile.firstName}</p>
            </div>
            <div>
              <Label className="text-sm">Last Name</Label>
              <p className="mt-1 text-lg font-medium">{profile.lastName}</p>
            </div>
            <div>
              <Label className="text-sm">Email</Label>
              <p className="mt-1 text-lg font-medium">{profile.email}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <Button onClick={() => setShowResetForm((prev) => !prev)} variant="secondary">
            {showResetForm ? "Cancel Password Reset" : "Reset Password"}
          </Button>
        </div>

        {showResetForm && (
          <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="repeatNewPassword" className="text-sm">
                Repeat New Password
              </Label>
              <Input
                id="repeatNewPassword"
                type="password"
                value={repeatNewPassword}
                onChange={(e) => setRepeatNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={resetLoading} className="w-full">
              {resetLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" aria-label="Close profile dialog">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
