import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  PlusIcon,
  UploadCloudIcon,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { code } from "../fonts/fonts";
import { useMediaQuery } from "react-responsive";

// Define file status type
type FileStatus = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
};

export default function UploadFiles({
  fetchData,
  currentFolder,
}: {
  fetchData: Function;
  currentFolder: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // Initialize file statuses
    setFileStatuses(
      files.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }))
    );

    setIsDialogOpen(true);

    // Upload files one by one for better tracking
    for (let i = 0; i < files.length; i++) {
      try {
        // Update status to uploading
        setFileStatuses((prev) =>
          prev.map((status, idx) =>
            idx === i ? { ...status, status: "uploading" } : status
          )
        );

        await uploadFile(files[i], i);

        // Update status to success
        setFileStatuses((prev) =>
          prev.map((status, idx) =>
            idx === i ? { ...status, status: "success", progress: 100 } : status
          )
        );
      } catch (error) {
        console.error(`Error uploading ${files[i].name}:`, error);
        // Update status to error
        setFileStatuses((prev) =>
          prev.map((status, idx) =>
            idx === i
              ? {
                  ...status,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : status
          )
        );
      }
    }

    // Calculate overall progress with safety checks
    const totalProgress = fileStatuses.reduce(
      (sum, file) => sum + (file?.progress || 0),
      0
    );

    // Guard against division by zero
    if (fileStatuses.length > 0) {
      setOverallProgress(Math.round(totalProgress / fileStatuses.length));
    }

    // After all files are processed, wait a bit then close dialog and refresh
    setTimeout(() => {
      setIsDialogOpen(false);
      fetchData();
      setFileStatuses([]);
    }, 2000);
  };

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("path", currentFolder);

    try {
      const response = await axios.post("/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentComplete = Math.round(
              progressEvent.total
                ? (progressEvent.loaded / progressEvent.total) * 100
                : 0
            );

            // Update progress for this file and calculate overall progress in one step
            setFileStatuses((prev) => {
              // Guard against empty arrays or component unmounting
              if (prev.length === 0) return prev;

              const updated = prev.map((status, idx) =>
                idx === index
                  ? { ...status, progress: percentComplete }
                  : status
              );

              // Calculate new overall progress with safety checks
              const totalProgress = updated.reduce(
                (sum, file) => sum + (file?.progress || 0),
                0
              );

              // Guard against division by zero
              if (updated.length > 0) {
                setOverallProgress(Math.round(totalProgress / updated.length));
              }

              // Return the updated file statuses
              return updated;
            });
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const getStatusIcon = (status: FileStatus["status"]) => {
    switch (status) {
      case "pending":
        return <div className="w-5 h-5 rounded-full bg-muted" />;
      case "uploading":
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <>
      {isDesktop ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleButtonClick}
        >
          <UploadCloudIcon className="mr-2 h-4 w-4" />
          Subir archivo
        </Button>
      ) : (
        <Button size="icon" variant="ghost" onClick={handleButtonClick}>
          <UploadCloudIcon className="h-5 w-5" />
        </Button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onChange={handleFileChange}
        multiple
      />

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className="w-[80%] transition-all rounded-3xl p-4 max-h-[80vh] overflow-y-auto overflow-x-hidden flex flex-col"
          style={{ fontFamily: code.style.fontFamily }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Subiendo archivos</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mb-4">
            <p className="text-sm mb-2">Progreso general: {overallProgress}%</p>
            <Progress value={overallProgress} className="mb-6" />

            <div className="space-y-3 mt-4">
              {fileStatuses.map((fileStatus, idx) => (
                <div key={idx} className="bg-background/30 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 truncate max-w-[80%]">
                      {getStatusIcon(fileStatus.status)}
                      <p className="text-sm font-medium truncate">
                        {fileStatus.file.name}
                      </p>
                    </div>
                    <span className="text-xs font-mono">
                      {fileStatus.progress}%
                    </span>
                  </div>

                  <Progress value={fileStatus.progress} className="h-1" />

                  {fileStatus.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileStatus.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
