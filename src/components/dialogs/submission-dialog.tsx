"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Assignment } from "@/lib/types";
import { useState } from "react";

interface SubmissionDialogProps {
  open: boolean;
  assignment: Assignment | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => void;
  isLoading: boolean;
}

export function SubmissionDialog({
  open,
  assignment,
  onOpenChange,
  onSubmit,
  isLoading
}: SubmissionDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assignment?.title} Submission</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input
              id="file"
              type="file"
              className="col-span-3"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => file && onSubmit(file)}
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
