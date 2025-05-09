import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReUpload: () => void;
  revisionComments: string;
}

export const ReUploadDialog: React.FC<ReUploadDialogProps> = ({
  isOpen,
  onClose,
  onReUpload,
  revisionComments,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-gray-300 bg-white text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Re-Upload Handout</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="rounded-md border border-gray-300 bg-gray-100 p-4">
            <h3 className="mb-2 text-sm font-medium">Revision Comments</h3>
            <p className="text-sm text-gray-600">{revisionComments}</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <Button
            onClick={handleFileSelect}
            className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50"
          >
            Select file from computer
          </Button>

          <Button
            onClick={onReUpload}
            className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50"
          >
            Re-upload handout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
