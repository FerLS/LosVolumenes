"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardPasteIcon,
  Download,
  Folder,
  FolderEdit,
  Music2Icon,
  Paperclip,
  PenTool,
  Scissors,
  Trash,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import type { CustomFile } from "@/app/types/File";
import JSZip from "jszip";
import FileDrawer from "./FileDrawer";
import { code } from "../fonts/fonts";
import VideoThumbnail from "./VideoThumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogTitle,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "react-responsive";

const FormSchema = z.object({
  folderName: z
    .string()
    .nonempty({ message: "El nombre de la carpeta no puede estar vacío" })
    .min(3, {
      message: "El nombre de la carpeta debe tener al menos 3 caracteres",
    })
    .max(20, {
      message: "El nombre de la carpeta no puede tener más de 20 caracteres",
    }),
});

interface FileGridProps {
  files: CustomFile[];
  folders: string[];
  fileType: string;
  fetchComplete: boolean;
  fetchData: Function;
  updateCurrentFolder: Function;
  currentFolder: string;
  gridSize: number;
}

export default function FileGrid({
  files,
  folders,
  fileType,
  fetchComplete,
  fetchData,
  updateCurrentFolder,
  gridSize,
  currentFolder,
}: FileGridProps) {
  const [loadedImages, setLoadedImages] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [visibleFiles, setVisibleFiles] = useState<Set<number>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const filteredFiles = files.filter(
    (file) => file.type === fileType || fileType === "All"
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleFiles((prev) =>
              new Set(prev).add(
                Number((entry.target as HTMLElement).dataset.index)
              )
            );
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".file-card");
    elements.forEach((el) => observer.current?.observe(el));

    return () => {
      observer.current?.disconnect();
    };
  }, [filteredFiles]);

  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  const handleFileSelect = (index: number) => {
    setTimeout(
      () => {
        setSelectedFiles((prev) => {
          const newSelectedFiles = new Set(prev);
          if (newSelectedFiles.has(index)) {
            newSelectedFiles.delete(index);
          } else {
            newSelectedFiles.add(index);
          }
          return newSelectedFiles;
        });
      },
      selectedFiles.size > 0 ? 0 : 200
    );
  };
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(
    new Set()
  );

  // Función para manejar la selección de carpetas
  const handleFolderSelect = (index: number) => {
    setSelectedFolders((prev) => {
      const newSelectedFolders = new Set(prev);
      if (newSelectedFolders.has(index)) {
        newSelectedFolders.delete(index);
      } else {
        newSelectedFolders.add(index);
      }
      return newSelectedFolders;
    });
  };

  const bind = useGesture({
    onPointerDown: ({ args: [index, type], event }) => {
      if (
        selectedFiles.size > 0 ||
        selectedFolders.size > 0 ||
        drawerOpen ||
        isDesktop
      )
        return;

      setRootMoveFolder(currentFolder);

      event.preventDefault();
      const timer = setTimeout(() => {
        if (type === "folder") {
          handleFolderSelect(index);
        } else {
          handleFileSelect(index);
        }
      }, 200);
      (event.target as any)._pressTimer = timer;
    },
    onPointerUp: ({ event }) => {
      if (
        selectedFiles.size > 0 ||
        selectedFolders.size > 0 ||
        drawerOpen ||
        isDesktop
      )
        return;

      clearTimeout((event.target as any)._pressTimer);
    },
    onPointerLeave: ({ event }) => {
      if (selectedFiles.size > 0 || selectedFolders.size > 0 || drawerOpen)
        return;

      if (event.target) {
        clearTimeout((event.target as any)._pressTimer);
      }
    },

    onContextMenu: ({ args: [index, type], event }) => {
      if (
        selectedFiles.size > 0 ||
        selectedFolders.size > 0 ||
        drawerOpen ||
        !isDesktop
      )
        return;

      setRootMoveFolder(currentFolder);
      event.preventDefault();

      if (type === "folder") {
        handleFolderSelect(index);
      } else {
        handleFileSelect(index);
      }
    },
  });

  const handleDelete = async () => {
    try {
      const urlsToDelete = Array.from(selectedFiles).map(
        (index) => filteredFiles[index].url
      );

      const foldersToDelete = Array.from(selectedFolders).map(
        (index) => currentFolder + "/" + folders[index]
      );

      if (urlsToDelete.length != 0) {
        const response = await fetch(`/api/files/`, {
          method: "DELETE",
          body: JSON.stringify({ urls: urlsToDelete }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          console.log("Files deleted successfully");
          fetchData();
        } else {
          console.error("Failed to delete files");
        }
      }
      if (foldersToDelete.length != 0) {
        const responseFolders = await fetch(`/api/folders/`, {
          method: "DELETE",
          body: JSON.stringify({ folders: foldersToDelete }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (responseFolders.ok) {
          console.log("Folders deleted successfully");
          fetchData();
        } else {
          console.error("Failed to delete folders");
        }
      }
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };
  const handleDownload = async () => {
    const zip = new JSZip();
    const folder = zip.folder("files");

    // Agregar archivos al ZIP
    for (const index of selectedFiles) {
      const file = filteredFiles[index];
      const response = await fetch(`/api/file?url=${file.url}`);
      const blob = await response.blob();
      if (folder) {
        folder.file(file.name, blob);
      }
    }

    // Agregar carpetas vacías al ZIP (opcional)
    for (const index of selectedFolders) {
      const folderName = folders[index];
      if (folder) {
        folder.folder(folderName);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "files_and_folders.zip";
    link.click();
  };

  const handleRename = async (newName: string) => {
    try {
      const folderIndex = Array.from(selectedFolders)[0];
      const oldPath = currentFolder + "/" + folders[folderIndex];
      const newPath = currentFolder + "/" + newName;

      const response = await fetch(`/api/folders/`, {
        method: "PUT",
        body: JSON.stringify({
          oldPaths: [oldPath],
          newPath: newPath,
          rename: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setTimeout(() => {
          setSelectedFolders(new Set());
          fetchData();
        }, 300);
      } else {
        console.error("Failed to rename file");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleMove = async () => {
    if (filesToMove.length != 0) {
      const filesResponse = await fetch(`/api/files/`, {
        method: "PUT",
        body: JSON.stringify({ urls: filesToMove, newUrl: currentFolder }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (filesResponse.ok) {
        console.log("Files moved successfully");
      } else {
        console.error("Failed to move files");
      }
    }

    if (foldersToMove.length != 0) {
      const foldersResponse = await fetch(`/api/folders/`, {
        method: "PUT",
        body: JSON.stringify({
          oldPaths: foldersToMove,
          newPath: currentFolder,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (foldersResponse.ok) {
        console.log("Folders moved successfully");
      } else {
        console.error("Failed to move folders");
      }
    }
    fetchData();
  };

  const [onMoving, setOnMoving] = useState(false);
  const [rootMoveFolder, setRootMoveFolder] = useState<string>("");

  const [canClick, setCanClick] = useState(true);

  const [filesToMove, setFilesToMove] = useState<string[]>([]);
  const [foldersToMove, setFoldersToMove] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsOpen(false);
    setIsDialogOpen(false);
    await handleRename(data.folderName);
  };

  return (
    <AnimatePresence>
      {filteredFiles.length === 0 && folders.length === 0 && fetchComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-foreground text-center font-bold flex items-center justify-center flex-col space-y-10 min-h-[70dvh] w-full"
          style={{ fontFamily: code.style.fontFamily }}
        >
          <p className="text-2xl">
            Aun queda espacio<br></br> por llenar...
          </p>
          <PenTool size={40}></PenTool>
          <p className="italic opacity-50">Tempus fugit</p>
        </motion.div>
      ) : (
        <>
          <div
            className={`grid grid-cols-2 gap-4`}
            style={{
              gridTemplateColumns: `repeat(${
                isDesktop ? 7 - gridSize : 2
              }, minmax(0, 1fr))`,
            }}
          >
            <AnimatePresence>
              {fetchComplete &&
                folders.map((folder, index) => (
                  <motion.div
                    key={index + folder + "folder"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    className={`relative file-card`}
                    data-index={index}
                    {...(bind(index, "folder") as any)}
                    onAnimationComplete={() => {
                      setCanClick(true);
                    }}
                    onClick={() => {
                      if (drawerOpen) {
                        return null;
                      } else if (
                        selectedFiles.size > 0 ||
                        selectedFolders.size > 0
                      ) {
                        if (onMoving) {
                          if (rootMoveFolder != currentFolder) {
                            setCanClick(false);
                            updateCurrentFolder(folder);
                          } else if (!selectedFolders.has(index)) {
                            setCanClick(false);
                            updateCurrentFolder(folder);
                          }
                        } else {
                          handleFolderSelect(index);
                        }
                      } else if (canClick) {
                        setCanClick(false);
                        updateCurrentFolder(folder);
                      } else {
                        return null;
                      }
                    }}
                  >
                    <Card
                      className={`bg-primary transition-all duration-200 aspect-square flex flex-col items-center justify-start hover:shadow-md hover:shadow-primary/10 ${
                        selectedFolders.has(index) &&
                        rootMoveFolder === currentFolder
                          ? `scale-90 outline outline-red-500 outline-offset-4 rounded-lg ${
                              onMoving ? " opacity-40" : ""
                            }`
                          : ""
                      }`}
                    >
                      <CardContent className="flex-grow relative overflow-hidden rounded-md p-0 w-[101%] -translate-y-1">
                        <div className="flex justify-center items-center w-full h-full bg-secondary">
                          <Folder
                            size={isDesktop ? 60 : 50}
                            className="stroke-primary"
                          ></Folder>
                        </div>
                      </CardContent>
                      <CardContent className="p-2 w-full">
                        <h3
                          className="text-sm text-black font-bold z-10 truncate"
                          style={{ fontFamily: code.style.fontFamily }}
                        >
                          {folder}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

              {fetchComplete &&
                filteredFiles.map((file, index) => (
                  <motion.div
                    key={index + file.url + "file"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    whileHover={
                      isDesktop
                        ? {
                            scale: 0.95,
                            transition: { duration: 0.1, delay: 0 },
                          }
                        : {}
                    }
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      scale: {
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                        restDelta: 0.001,
                      },
                    }}
                    className={`relative file-card`}
                    data-index={index}
                    {...(bind(index, "file") as any)}
                    onClick={() =>
                      drawerOpen
                        ? null
                        : selectedFiles.size > 0 || selectedFolders.size > 0
                        ? !onMoving && handleFileSelect(index)
                        : canClick
                        ? () => {
                            setTimeout(() => {
                              setCanClick(false);
                            }, 10);
                            setSelectedFiles(new Set([index]));
                          }
                        : null
                    }
                  >
                    {!selectedFiles.has(index) && canClick && (
                      <FileDrawer
                        files={filteredFiles}
                        initialIndex={index}
                        fetchData={fetchData}
                        isSelecting={selectedFiles.size > 0}
                        setDrawerOpen={setDrawerOpen}
                      />
                    )}
                    <Card
                      className={`bg-secondary transition-all duration-200 aspect-square flex flex-col hover:shadow-md hover:shadow-primary/10 ${
                        selectedFiles.has(index) &&
                        rootMoveFolder === currentFolder
                          ? `scale-90 outline outline-red-500 outline-offset-4 rounded-lg ${
                              onMoving ? " opacity-40" : ""
                            }`
                          : ""
                      }`}
                    >
                      <CardContent className="flex-grow relative overflow-hidden rounded-md px-0 py-0">
                        {file.type === "Image" && visibleFiles.has(index) ? (
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_DEMO
                                ? file.url
                                : `/api/file?url=${file.url}`
                            }
                            alt="File"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: "cover" }}
                            className={`${
                              selectedFiles.has(index) &&
                              onMoving &&
                              rootMoveFolder === currentFolder
                                ? " opacity-40"
                                : ""
                            }`}
                            onLoad={handleImageLoad}
                          />
                        ) : file.type === "Video" && visibleFiles.has(index) ? (
                          <div className="flex justify-center items-center w-full h-full bg-transparent relative ">
                            <Skeleton className="h-full w-full absolute"></Skeleton>

                            <VideoThumbnail
                              videoUrl={`/api/file?url=${file.url}`}
                              onMoving={
                                selectedFiles.has(index) &&
                                onMoving &&
                                rootMoveFolder === currentFolder
                              }
                            ></VideoThumbnail>
                          </div>
                        ) : file.type === "Audio" && visibleFiles.has(index) ? (
                          <div className="flex justify-center items-center w-full h-full bg-primary">
                            <Music2Icon
                              size={isDesktop ? 50 : 40}
                              className="stroke-secondary"
                            ></Music2Icon>
                          </div>
                        ) : file.type === "Other" && visibleFiles.has(index) ? (
                          <div className="flex justify-center items-center w-full h-full bg-primary">
                            <Paperclip
                              size={isDesktop ? 50 : 40}
                              className="stroke-secondary"
                            ></Paperclip>
                          </div>
                        ) : (
                          <Skeleton className="h-full w-full absolute"></Skeleton>
                        )}
                      </CardContent>
                      {(file.type === "Audio" || file.type === "Other") && (
                        <CardContent className="p-2">
                          <h3
                            className="text-sm text-white z-10 truncate"
                            style={{ fontFamily: code.style.fontFamily }}
                          >
                            {(file.url &&
                              file.url.split("/").pop()?.split("-").pop()) ||
                              file.name ||
                              "Unnamed File"}
                          </h3>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!onMoving &&
              (selectedFiles.size > 0 || selectedFolders.size > 0) && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.1 }}
                    className={`fixed ${
                      isDesktop ? "bottom-10 right-10" : "bottom-40 right-0"
                    } z-40 flex flex-col space-y-4`}
                  >
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedFiles(new Set());
                        setSelectedFolders(new Set());
                      }}
                      className={`${
                        isDesktop ? "p-8 rounded-full" : "p-8 rounded-l-full"
                      } cancel-button`}
                    >
                      <XIcon
                        size={isDesktop ? 24 : 40}
                        className="stroke-secondary min-h-8 min-w-8"
                      ></XIcon>
                      {isDesktop && <p className="text-xl ">Cancel</p>}
                    </Button>

                    <Button
                      variant="default"
                      className={`${
                        isDesktop ? "p-8 rounded-full" : "p-8 rounded-l-full"
                      } bg-yellow-500`}
                      onClick={() => {
                        setFilesToMove(
                          Array.from(selectedFiles).map(
                            (index) => filteredFiles[index].url
                          )
                        );
                        setFoldersToMove(
                          Array.from(selectedFolders).map(
                            (index) => currentFolder + "/" + folders[index]
                          )
                        );

                        setOnMoving(true);
                      }}
                    >
                      <Scissors
                        size={isDesktop ? 24 : 40}
                        className="stroke-secondary min-h-8 min-w-8"
                      ></Scissors>
                      {isDesktop && <p className="text-xl ">Cut</p>}
                    </Button>

                    <Button
                      variant="default"
                      onClick={() => {
                        handleDownload();
                        setSelectedFiles(new Set());
                        setSelectedFolders(new Set());
                      }}
                      className={`${
                        isDesktop ? "p-8 rounded-full" : "p-8 rounded-l-full"
                      } bg-green-500`}
                    >
                      <Download
                        size={isDesktop ? 24 : 40}
                        className="stroke-secondary min-h-8 min-w-8"
                      ></Download>
                      {isDesktop && <p className="text-xl ">Download</p>}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className={`bg-red-500 ${
                            isDesktop
                              ? "p-8 rounded-full"
                              : "p-8 rounded-l-full"
                          }`}
                        >
                          <Trash
                            size={isDesktop ? 24 : 40}
                            className="stroke-white min-h-8 min-w-8"
                          ></Trash>
                          {isDesktop && (
                            <p className="text-xl text-secondary-foreground">
                              Delete
                            </p>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="w-[80%] transition-all rounded-xl p-4 max-h-[80vh] overflow-y-scroll overflow-x-hidden flex flex-col"
                        style={{ fontFamily: code.style.fontFamily }}
                      >
                        <DialogTitle className="text-xl">
                          Seguro quieres Borrarlo?
                        </DialogTitle>
                        <DialogDescription>
                          {" "}
                          No hay vuelta atrás
                        </DialogDescription>
                        <div className="flex justify-between space-x-5">
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleDelete();
                              setSelectedFiles(new Set());
                              setSelectedFolders(new Set());
                            }}
                            className="w-full"
                          >
                            Borrar
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => {
                              setSelectedFiles(new Set());
                              setSelectedFolders(new Set());
                            }}
                            className="w-full"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>

                  {!isDesktop && (
                    <>
                      {" "}
                      <div
                        className="fixed top-0 right-0 z-[100] w-full h-28"
                        onClick={() => {
                          setSelectedFiles(new Set());
                          setSelectedFolders(new Set());
                        }}
                      ></div>
                      <div
                        className="fixed bottom-0 right-0 z-[100] w-full h-28"
                        onClick={() => {
                          setSelectedFiles(new Set());
                          setSelectedFolders(new Set());
                        }}
                      ></div>
                    </>
                  )}
                </>
              )}
          </AnimatePresence>
        </>
      )}

      {onMoving && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.1 }}
          className={`fixed ${
            isDesktop ? "bottom-10 left-10" : "bottom-40 left-0"
          } z-40 flex flex-col space-y-4`}
        >
          <Button
            variant="default"
            onClick={() => {
              setSelectedFiles(new Set());
              setSelectedFolders(new Set());
              setOnMoving(false);
            }}
            className={`${
              isDesktop ? "p-4 rounded-full" : "p-8 rounded-r-full"
            } cancel-button`}
          >
            <XIcon
              size={isDesktop ? 24 : 40}
              className="stroke-secondary min-h-8 min-w-8"
            ></XIcon>
          </Button>
          <Button
            variant="default"
            className={`${
              isDesktop ? "p-8 rounded-full" : "p-8 rounded-r-full"
            } bg-yellow-500`}
            onClick={() => {
              handleMove();
              setSelectedFiles(new Set());
              setSelectedFolders(new Set());
              setOnMoving(false);
            }}
          >
            <ClipboardPasteIcon
              size={isDesktop ? 24 : 40}
              className="stroke-secondary min-h-8 min-w-8"
            ></ClipboardPasteIcon>
            {isDesktop && <p className="text-xl ">Move</p>}
          </Button>
        </motion.div>
      )}
      {selectedFolders.size === 1 && selectedFiles.size === 0 && !onMoving && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.1 }}
          className={`fixed ${
            isDesktop ? "bottom-10 left-10" : "bottom-40 left-0"
          } z-40 flex flex-col space-y-4`}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsDialogOpen(!isDialogOpen);
                  form.reset();
                }}
                className={`${
                  isDesktop ? "p-8 rounded-full" : "p-8 rounded-r-full"
                } bg-orange-500`}
              >
                <FolderEdit
                  size={isDesktop ? 24 : 40}
                  className="stroke-secondary min-h-8 min-w-8"
                />
              </Button>
            </DialogTrigger>
            <DialogContent
              style={{ fontFamily: code.style.fontFamily }}
              className="text-xl w-[80%] transition-all rounded-xl p-4 max-h-[80vh] overflow-y-scroll overflow-x-hidden flex flex-col"
            >
              <DialogTitle>Crear nueva carpeta</DialogTitle>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="folderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lo que tu quieras</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre de la carpeta"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Renombrar</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
