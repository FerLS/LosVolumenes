"use client";

import { useState, useEffect } from "react";
import { useDrag, usePinch } from "@use-gesture/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { CustomFile } from "../types/File";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Download,
  Trash,
  FileText,
  FilePen,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Share2,
  Star,
  Music,
} from "lucide-react";
import Image from "next/image";
import { code } from "../fonts/fonts";
import TxtFileViewer from "./TxtFileViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "react-responsive";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { set } from "mongoose";

const FormSchema = z.object({
  fileName: z
    .string()
    .nonempty({ message: "El nombre del archivo no puede estar vacío" })
    .min(3, {
      message: "El nombre del archivo debe tener al menos 3 caracteres",
    }),
});

export default function FileDrawer({
  files,
  initialIndex,
  fetchData,
  isSelecting,
  setDrawerOpen,
}: {
  files: CustomFile[];
  initialIndex: number;
  fetchData: Function;
  isSelecting: boolean;
  setDrawerOpen: Function;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [opacity, setOpacity] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [isOpen, setIsOpen] = useState(false);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setOpacity(1);
      setTranslateX(0);
      setTranslateY(0);
      setScale(1);
    }
  }, [isOpen]);

  const bind = useDrag(({ swipe: [swipeX] }) => {
    if (swipeX === -1) {
      // Swipe left - next file
      navigateToNextFile();
    } else if (swipeX === 1) {
      // Swipe right - previous file
      navigateToPreviousFile();
    }
    setScale(1);
  });

  const navigateToNextFile = () => {
    setOpacity(0);
    setTranslateX(-100);
    setTranslateY(-20);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
      setTranslateX(100);
      setTranslateY(20);
      setTimeout(() => {
        setOpacity(1);
        setTranslateX(0);
        setTranslateY(0);
      }, 200);
    }, 200);
  };

  const navigateToPreviousFile = () => {
    setOpacity(0);
    setTranslateX(100);
    setTranslateY(20);
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + files.length) % files.length
      );
      setTranslateX(-100);
      setTranslateY(-20);
      setTimeout(() => {
        setOpacity(1);
        setTranslateX(0);
        setTranslateY(0);
      }, 200);
    }, 200);
  };

  const pinch = usePinch(({ offset: [d] }) => {
    setScale((prev) => Math.max(0.5, Math.min(prev * (1 + d / 100), 3)));
  });

  const file = files[currentIndex];

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/file?url=${file.url}`;
    link.download = file.url.split("/").pop() || Date.now().toString();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/files/`, {
        method: "DELETE",
        body: JSON.stringify({ urls: [file.url] }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("File deleted successfully");
        setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
        if (isDesktop) {
          setIsOpen(false);
        } else {
          const drawerTrigger = document.querySelector(".drawer-closer");
          if (drawerTrigger) {
            (drawerTrigger as HTMLElement).click();
          }
        }
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
        console.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleRename = async (newName: string) => {
    try {
      const response = await fetch(`/api/files/`, {
        method: "PUT",
        body: JSON.stringify({
          urls: [file.url],
          newUrl: file.url.split("/").slice(0, -1).join("/") + "/" + newName,
          rename: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("File renamed successfully");
        if (isDesktop) {
          setIsOpen(false);
        } else {
          const drawerTrigger = document.querySelector(".drawer-closer");
          if (drawerTrigger) {
            (drawerTrigger as HTMLElement).click();
          }
        }
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
        console.error("Failed to rename file");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleShare = async () => {
    try {
      // Fetch the file first
      const response = await fetch(`/api/file?url=${file.url}`);
      const blob = await response.blob();

      // Create a file from the blob with the proper name and type
      const fileName = getFileName();
      const fileExt = getFileExtension().toLowerCase();
      const fileType =
        file.type === "Image"
          ? `image/${fileExt}`
          : file.type === "Video"
          ? `video/${fileExt}`
          : file.type === "Audio"
          ? `audio/${fileExt}`
          : "application/octet-stream";

      // Extract base name without extension if it already has one
      const baseName = fileName.includes(".")
        ? fileName.substring(0, fileName.lastIndexOf("."))
        : fileName;

      const shareFile = new File([blob], `${baseName}.${fileExt}`, {
        type: fileType,
      });

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          title: baseName,
          files: [shareFile],
        });
      } else {
        // Fallback to clipboard if sharing fails
        navigator.clipboard.writeText(file.url);
        alert(
          "URL copiada al portapapeles (el navegador no soporta compartir archivos)"
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Error al compartir el archivo");
    }
  };

  const handleFavorite = async (isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/file/`, {
        method: "PUT",
        body: JSON.stringify({ url: [file.url], favorite: isFavorite }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("File marked as favorite successfully");
        file.favorite = isFavorite;
      } else {
        console.error("Failed to mark file as favorite");
      }
    } catch (error) {
      console.error("Error marking file as favorite:", error);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fileName: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsDialogOpen(false);
    await handleRename(
      file.url.split("/").pop()?.split("-")[0] + "-" + data.fileName
    );
  };

  // Get file name from URL
  const getFileName = () => {
    const fullName = file?.url.split("/").pop() || "";
    const nameParts = fullName.split("-");
    return nameParts.length > 1 ? nameParts[1] : fullName;
  };

  // Get file extension
  const getFileExtension = () => {
    const fullName = file?.url.split("/").pop() || "";
    const parts = fullName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  };

  // Get file size (mock function - would need to be implemented with actual file size)
  const getFileSize = () => {
    const size = file?.size || "0 KB";
    return size;
  };

  // Get file type badge color
  const getFileTypeBadgeColor = () => {
    switch (file?.type) {
      case "Image":
        return "bg-[hsl(var(--chart-1)/0.2)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)/0.3)]";
      case "Video":
        return "bg-[hsl(var(--chart-2)/0.2)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.3)]";
      case "Audio":
        return "bg-[hsl(var(--chart-3)/0.2)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.3)]";
      default:
        return "bg-[hsl(var(--chart-4)/0.2)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.3)]";
    }
  };

  // Render file content based on type
  const renderFileContent = () => {
    if (!file) return null;

    if (file.type === "Image") {
      return (
        <div
          className={`w-full grow bg-background flex items-center justify-center relative ${
            !isDesktop ? "touch-none" : ""
          }`}
          {...(isDesktop ? {} : bind())}
          style={{ touchAction: isDesktop ? "auto" : "none" }}
        >
          <div className="relative w-full h-full min-h-[60vh] flex items-center justify-center">
            <Image
              src={`/api/file?url=${file.url}`}
              alt={getFileName()}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              style={{
                opacity,
                transform: `translateX(${translateX}px) scale(${scale})`,
                objectFit: "contain",
              }}
              className={`transition-all duration-300`}
              {...(isDesktop ? {} : pinch())}
            />
          </div>
        </div>
      );
    } else if (file.type === "Video") {
      return (
        <div
          className={`w-full grow bg-background flex items-center justify-center relative py-10 ${
            !isDesktop ? "touch-none" : ""
          }`}
          {...(isDesktop ? {} : bind())}
          style={{ touchAction: isDesktop ? "auto" : "none" }}
        >
          <video
            src={`/api/file?url=${file.url}`}
            controls
            className="w-full h-full max-h-[80vh]"
          />
        </div>
      );
    } else if (file.type === "Audio") {
      return (
        <div
          className={`w-full grow bg-background flex flex-col items-center justify-center relative ${
            !isDesktop ? "touch-none" : ""
          } p-8`}
          {...(isDesktop ? {} : bind())}
          style={{ touchAction: isDesktop ? "auto" : "none" }}
        >
          <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border shadow-md mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                <Music className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-6 text-foreground">
              {getFileName()}
            </h3>
            <audio
              src={`/api/file?url=${file.url}`}
              controls
              className="w-full"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div
          className={`w-full grow bg-background flex items-center justify-center relative ${
            !isDesktop ? "touch-none" : ""
          }`}
          {...(isDesktop ? {} : bind())}
          style={{ touchAction: isDesktop ? "auto" : "none" }}
        >
          {file.url.includes("txt") ? (
            <TxtFileViewer
              fileUrl={file.url}
              className="w-[80%] h-[70%] absolute m-auto pointer-events-none text-foreground"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <FileText size={100} className="text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                {getFileName()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getFileExtension()}
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  // Desktop dialog version
  if (isDesktop) {
    return (
      <>
        {!isSelecting && (
          <div
            className="absolute top-0 w-full h-full z-20 cursor-pointer "
            onClick={() => setIsOpen(true)}
          ></div>
        )}

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent
            className="max-w-6xl w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-background border-border"
            style={{ fontFamily: code.style.fontFamily }}
          >
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`${getFileTypeBadgeColor()}`}
                  >
                    {file?.type}
                  </Badge>
                  <h2 className="text-lg font-medium text-foreground truncate max-w-[300px]">
                    {getFileName()}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialogCancel asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </AlertDialogCancel>
                </div>
              </div>

              {/* Main content */}
              <div className="flex flex-1 overflow-hidden">
                {/* File viewer */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  {/* Navigation buttons */}
                  {files.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/30 backdrop-blur-sm hover:bg-background/50 rounded-full h-10 w-10"
                        onClick={navigateToPreviousFile}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/30 backdrop-blur-sm hover:bg-background/50 rounded-full h-10 w-10"
                        onClick={navigateToNextFile}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}

                  {/* File content */}
                  {renderFileContent()}
                </div>

                {/* Info sidebar */}

                <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
                  <h3 className="text-lg font-medium mb-4 text-foreground">
                    Información del archivo
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Nombre
                      </h4>
                      <p className="text-foreground truncate">
                        {getFileName()}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Tipo
                      </h4>
                      <p className="text-foreground">{file?.type}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Tamaño
                      </h4>
                      <p className="text-foreground">{getFileSize()}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Fecha
                      </h4>
                      <p className="text-foreground">{file?.date}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Ubicación
                      </h4>
                      <p className="text-foreground">{file?.location}</p>
                    </div>

                    <Separator />

                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Acciones
                      </h4>
                      <div className="flex flex-col gap-2">
                        {(file?.type === "Audio" || file?.type === "Other") && (
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => {
                                  setIsDialogOpen(!isDialogOpen);
                                  form.reset();
                                }}
                              >
                                <FilePen className="mr-2 h-4 w-4" />
                                Renombrar
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              style={{ fontFamily: code.style.fontFamily }}
                              className="text-xl w-[80%] max-w-md transition-all rounded-xl p-4 max-h-[80vh] overflow-y-auto"
                            >
                              <DialogTitle>Renombrar archivo</DialogTitle>

                              <Form {...form}>
                                <form
                                  onSubmit={form.handleSubmit(onSubmit)}
                                  className="w-full space-y-6"
                                >
                                  <FormField
                                    control={form.control}
                                    name="fileName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Lo que prefieras</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Nombre del archivo"
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
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={handleDownload}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={handleShare}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Compartir
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={() => {
                            handleFavorite(!file.favorite);
                          }}
                        >
                          <Star
                            className={`mr-2 h-4 w-4 ${
                              file.favorite
                                ? "fill-yellow-400 text-yellow-400"
                                : ""
                            }`}
                          />
                          {file.favorite
                            ? "Quitar favorito"
                            : "Marcar favorito"}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start text-destructive hover:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="w-[80%] max-w-md transition-all rounded-xl p-4 max-h-[80vh] overflow-y-auto"
                            style={{ fontFamily: code.style.fontFamily }}
                          >
                            <DialogTitle className="text-xl">
                              Seguro quieres Borrarlo?
                            </DialogTitle>
                            <DialogDescription>
                              No hay vuelta atrás
                            </DialogDescription>
                            <div className="flex justify-between space-x-5 mt-4">
                              <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="w-full"
                              >
                                Borrar
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline" className="w-full">
                                  Cancelar
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Mobile drawer version
  return (
    <Drawer
      onOpenChange={(open) => {
        setDrawerOpen(open);
        setIsOpen(open);
      }}
    >
      {!isSelecting && (
        <DrawerTrigger className="absolute top-0 w-full h-full z-20"></DrawerTrigger>
      )}
      <DrawerContent
        className="h-screen bg-background text-foreground "
        style={{ fontFamily: code.style.fontFamily }}
      >
        <div className="flex flex-col h-full">
          <DrawerHeader className="p-0 h-full">
            {renderFileContent()}
          </DrawerHeader>

          <div className="flex p-5 items-center justify-between bg-card rounded-t-3xl -mt-5 z-20 border-t border-border shadow-sm ">
            <div className="overflow-hidden">
              <div
                className="transition-all duration-300 flex items-center space-x-2"
                style={{ transform: `translateY(${translateY}px)`, opacity }}
              >
                <Calendar className="text-primary h-4 w-4" />
                <DrawerTitle className="text-sm font-medium">
                  {file?.date}
                </DrawerTitle>
              </div>
            </div>
            <div className="overflow-hidden">
              <div
                className="transition-all duration-300 flex items-center space-x-2 truncate max-w-40"
                style={{ transform: `translateY(${translateY}px)`, opacity }}
              >
                <MapPin className="text-primary h-4 w-4" />
                <DrawerTitle className="text-sm font-medium">
                  {file?.location}
                </DrawerTitle>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 bg-card ">
            <Badge
              variant="outline"
              className={`${getFileTypeBadgeColor()} mb-2`}
            >
              {file?.type}
            </Badge>
            <h2 className="text-lg font-medium text-foreground truncate">
              {getFileName()}
            </h2>
            <p className="text-sm text-muted-foreground">{getFileSize()}</p>
          </div>
        </div>

        <DrawerFooter className="flex justify-between flex-row z-20 bg-card border-t border-border">
          <DrawerClose className="flex items-center flex-row justify-start drawer-closer">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </DrawerClose>
          <div className="flex space-x-2">
            {(file?.type === "Audio" || file?.type === "Other") && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDialogOpen(!isDialogOpen);
                      form.reset();
                    }}
                  >
                    <FilePen className="mr-2 h-4 w-4" />
                    Renombrar
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{ fontFamily: code.style.fontFamily }}
                  className="w-[80%] transition-all rounded-xl p-4 max-h-[80vh] overflow-y-auto"
                >
                  <DialogTitle>Renombrar archivo</DialogTitle>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="fileName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lo que prefieras</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nombre del archivo"
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
            )}

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className=" h-4 w-4" />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className=" h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-[80%] transition-all rounded-xl p-4 max-h-[80vh] overflow-y-auto"
                style={{ fontFamily: code.style.fontFamily }}
              >
                <DialogTitle className="text-xl">
                  Seguro quieres Borrarlo?
                </DialogTitle>
                <DialogDescription>No hay vuelta atrás</DialogDescription>
                <div className="flex justify-between space-x-5 mt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full"
                  >
                    Borrar
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className=" h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleFavorite(!file.favorite);
              }}
            >
              <Star
                className={` h-4 w-4 ${
                  file.favorite ? "fill-yellow-400 text-yellow-400" : ""
                }`}
              />
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
