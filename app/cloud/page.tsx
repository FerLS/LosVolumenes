"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LoaderCircle,
  Search,
  CassetteTape,
  Images,
  FilmIcon,
  Music,
  BookMarked,
  Grid3X3Icon,
  CircleIcon,
  Clock,
  Star,
  Settings,
  Upload,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FileAudioIcon,
  FolderPlusIcon,
  ArrowLeft,
} from "lucide-react";
import { fileTypes, type CustomFile } from "@/app/types/File";
import { ViewModeNav } from "@/app/components/ViewMode";
import axios from "axios";
import BottomNav from "@/app/components/BottomNav";
import { code } from "@/app/fonts/fonts";
import React from "react";
import FolderSystem from "@/app/components/FolderSystem";
import CreateNew from "@/app/components/CreateNew";
import { Button } from "@/components/ui/button";
import FileGrid from "@/app/components/FileGrid";
import FileTurntable from "@/app/components/FileTurntable";
import { Input } from "@/components/ui/input";
import Courtain from "../components/Courtain";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UploadFiles from "@/app/components/UploadFile";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMediaQuery } from "react-responsive";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreateFolder from "../components/CreateFolder";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  return (
    <Suspense>
      <Cloud />
    </Suspense>
  );
}

function Cloud() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "turntable">(
    "grid"
  );
  const [currentFileType, setCurrentFileType] = useState(fileTypes[0]);
  const [favorites, setFavorites] = useState(false);
  const [files, setFiles] = useState<CustomFile[]>([]);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => {
    // Check if there's a query parameter in the URL
    const queryParam = searchParams.get("search");
    return queryParam || "";
  });
  const [gridSize, setGridSize] = useState(2);
  const FETCHDELAY = 600;
  const isDesktop = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const fetchFiles = async (type?: string, folder?: string) => {
    try {
      const response = await axios.get(
        `/api/files?type=${type != null ? type : currentFileType}&path=${
          folder != null ? folder : currentFolder
        }`
      );

      setFiles([]);
      setTimeout(() => {
        setFiles(response.data);
      }, FETCHDELAY);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const [currentFolder, setCurrentFolder] = useState<string>("/drive");

  const updateCurrentFolder = async (newfolder: string, fixed = false) => {
    setCurrentFolder(fixed ? newfolder : currentFolder + "/" + newfolder);
    fetchData(
      currentFileType,
      fixed ? newfolder : currentFolder + "/" + newfolder
    );
  };

  const [folders, setFolders] = useState<string[]>([]);

  const fetchFolders = async (folder?: string) => {
    try {
      const response = await axios.get(
        "/api/folders?path=" + (folder != null ? folder : currentFolder)
      );
      setFolders([]);
      setTimeout(() => {
        setFolders(response.data);
        setFetchComplete(true);
      }, FETCHDELAY);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchData = async (type?: string, folder?: string) => {
    setFetchComplete(false);
    await fetchFiles(type, folder);
    await fetchFolders(folder);
  };

  const createFolder = async (folder: string) => {
    try {
      await axios.post("/api/folders", { path: currentFolder + "/" + folder });
      fetchData();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setIsRendered(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (searchParams && typeof window !== "undefined") {
      const fileType = searchParams.get("type");
      const favorites = searchParams.get("favorites") === "true";
      if (fileType) {
        setCurrentFileType(fileType);
      }
      if (favorites) {
        setFavorites(favorites);
      }
    }
  }, [searchParams]);

  // Generate breadcrumb items from current folder path
  const breadcrumbItems = () => {
    const parts = currentFolder.split("/").filter((part) => part);
    return [
      { name: "drive", path: "/drive" },
      ...parts.slice(1).map((part, index) => {
        const path = "/" + parts.slice(0, index + 2).join("/");
        return { name: part, path };
      }),
    ];
  };

  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.url
          .split("/")
          .pop()
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : files;

  const filteredFolders = searchQuery
    ? folders.filter((folder) =>
        folder.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : folders;

  const favoriteFiles = files.filter((file) => file.favorite);
  // Get icon based on file type
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "Image":
        return <Images className="mr-2 h-5 w-5" />;
      case "Video":
        return <FilmIcon className="mr-2 h-5 w-5" />;
      case "Audio":
        return <Music className="mr-2 h-5 w-5" />;
      case "Other":
        return <BookMarked className="mr-2 h-5 w-5" />;
      default:
        return <CassetteTape className="mr-2 h-5 w-5" />;
    }
  };

  // Get gradient class based on file type
  const getFileTypeGradient = (type: string) => {
    switch (type) {
      case "Image":
        return `from-secondary to-[hsl(var(--chart-1))] dark:from-secondary dark:to-[hsl(var(--chart-1)/0.15)]`;
      case "Video":
        return `from-secondary to-[hsl(var(--chart-2))] dark:from-secondary dark:to-[hsl(var(--chart-2)/0.15)]`;
      case "Audio":
        return `from-secondary to-[hsl(var(--chart-3))] dark:from-secondary dark:to-[hsl(var(--chart-3)/0.15)]`;
      case "Other":
        return `from-secondary to-[hsl(var(--chart-4))] dark:from-secondary dark:to-[hsl(var(--chart-4)/0.15)]`;
      default:
        return "from-secondary to-primary/80";
    }
  };

  return (
    <>
      <Courtain isLoaded={isLoaded} />
      <div
        className={`flex flex-col min-h-screen h-screen bg-background ${
          isDesktop ? "overflow-hidden" : ""
        }`}
        style={{ fontFamily: code.style.fontFamily }}
      >
        {/* Desktop Layout */}
        {isDesktop ? (
          <div className="flex flex-1 h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:bg-gradient-to-b md:from-[hsl(var(--surface-2))] md:to-[hsl(var(--surface-2)/0.95)] md:h-screen md:p-6 md:border-r md:border-border md:shadow-md">
              <button
                className="flex items-center gap-3 mb-10"
                onClick={() => {
                  setIsLoaded(false);
                  setTimeout(() => {
                    router.push("/main");
                  }, 500);
                }}
              >
                <CassetteTape size={32} className="text-primary" />
                <h1 className="text-xl font-bold text-foreground">
                  Los Volumenes
                </h1>
              </button>

              <div className="space-y-1">
                <Button
                  variant={currentFileType === "All" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentFileType("All");
                    fetchData("All");
                  }}
                >
                  <FileIcon className=" h-4 w-4" />
                  Todos los archivos
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-primary hover:bg-accent ${
                    favorites ? " text-primary" : ""
                  }`}
                  onClick={() => setFavorites(!favorites)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Favoritos
                  <Switch
                    className="ml-auto data-[state=checked]:bg-yellow-400 data-[state=checked]:text-primary-foreground"
                    checked={favorites}
                  />
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                  Categorías
                </h3>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-primary hover:bg-accent ${
                    currentFileType === "Image" ? "bg-accent text-primary" : ""
                  }`}
                  onClick={() => {
                    setCurrentFileType("Image");
                    fetchData("Image");
                  }}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Imágenes
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-primary hover:bg-accent ${
                    currentFileType === "Video" ? "bg-accent text-primary" : ""
                  }`}
                  onClick={() => {
                    setCurrentFileType("Video");
                    fetchData("Video");
                  }}
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Videos
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-primary hover:bg-accent ${
                    currentFileType === "Audio" ? "bg-accent text-primary" : ""
                  }`}
                  onClick={() => {
                    setCurrentFileType("Audio");
                    fetchData("Audio");
                  }}
                >
                  <FileAudioIcon className="mr-2 h-4 w-4" />
                  Audio
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-primary hover:bg-accent ${
                    currentFileType === "Other" ? "bg-accent text-primary" : ""
                  }`}
                  onClick={() => {
                    setCurrentFileType("Other");
                    fetchData("Other");
                  }}
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Otros
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                  Vistas
                </h3>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    viewMode === "grid" ? "border-primary border" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3Icon className="mr-2 h-4 w-4" />
                  Cuadrícula
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    viewMode === "turntable" ? "border-primary border" : ""
                  }`}
                  onClick={() => setViewMode("turntable")}
                >
                  <CircleIcon className="mr-2 h-4 w-4" />
                  Turntable
                </Button>
              </div>
              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                  Tamaño de la vista
                </h3>
                <div className="space-y-3">
                  <div className="relative flex-1 mx-2">
                    <Slider
                      defaultValue={[2]}
                      max={4}
                      min={1}
                      step={1}
                      className="w-full"
                      onValueChange={(value) => {
                        setGridSize(value[0]);
                      }}
                      value={[gridSize]}
                    />
                    <div className="flex justify-between mt-4 text-xs text-muted-foreground ">
                      <span>S</span>
                      <span>M</span>
                      <span>L</span>
                      <span>XL</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8  space-y-2">
                <UploadFiles
                  fetchData={fetchData}
                  currentFolder={currentFolder}
                />
                <CreateFolder
                  fetchData={fetchData}
                  createFolder={createFolder}
                  currentFolder={currentFolder}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className={"flex-1 flex flex-col overflow-hidden"}>
              {/* Header with search and breadcrumbs */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[hsl(var(--surface-2)/0.7)] to-[hsl(var(--surface-2)/0.3)] border-b border-border backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-foreground">
                      {currentFileType === "All"
                        ? "Todos los archivos"
                        : currentFileType}
                    </h2>
                  </div>
                  <Breadcrumb className="overflow-hidden">
                    <BreadcrumbList>
                      {breadcrumbItems().map((item, index) => (
                        <React.Fragment key={item.path}>
                          <BreadcrumbItem>
                            <BreadcrumbLink
                              onClick={() =>
                                updateCurrentFolder(item.path, true)
                              }
                              className="hover:text-primary transition-colors cursor-pointer"
                            >
                              {item.name}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {index < breadcrumbItems().length - 1 && (
                            <BreadcrumbSeparator />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar archivos..."
                      className="pl-8 bg-[hsl(var(--surface-3))] border-none text-foreground focus-visible:ring-primary focus-visible:ring-offset-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <main
                className={`flex-1 ${
                  isDesktop ? "overflow-auto relative" : ""
                } p-6 bg-background`}
              >
                <AnimatePresence>
                  {(!isRendered || !fetchComplete) && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, transition: { delay: 0 } }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                      className="text-foreground text-center font-bold flex items-center justify-center flex-col space-y-10 min-h-[70dvh] w-full absolute inset-0 transform"
                      style={{
                        fontFamily: code.style.fontFamily,
                      }}
                    >
                      <p className="text-3xl">
                        {!isRendered ? "Cargando..." : "Buscando..."}
                      </p>
                      {!isRendered ? (
                        <LoaderCircle className="animate-spin" size={50} />
                      ) : (
                        <Search size={50} />
                      )}
                    </motion.div>
                  )}

                  {isRendered && (
                    <motion.div
                      key={viewMode + currentFileType + searchQuery}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full absolute w-full top-0 left-0 p-6"
                    >
                      {/* File type header with gradient */}
                      {isDesktop && (
                        <div className="w-full h-6 -translate-y-6 fixed from-background to-background/0  bg-gradient-to-b z-20"></div>
                      )}
                      <div className="flex items-center justify-between mb-6 space-x-4 top-0 z-10 bg-background ">
                        <Button
                          variant="ghost"
                          className="rounded-xl h-full bg-red-200 p-4 hover:scale-125 transition-transform"
                          onClick={() => {
                            if (currentFolder !== "/drive") {
                              const parts = currentFolder.split("/");
                              parts.pop();
                              const newFolder = parts.join("/") || "/drive";
                              updateCurrentFolder(newFolder, true);
                            }
                          }}
                          disabled={currentFolder === "/drive"}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ArrowLeft className="h-5 w-5 stroke-background" />
                          </motion.div>
                        </Button>

                        <div
                          className={` p-4 rounded-xl bg-gradient-to-r w-full ${getFileTypeGradient(
                            currentFileType
                          )} shadow-sm border border-border`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getFileTypeIcon(currentFileType)}
                              <h2 className="text-lg font-semibold text-foreground">
                                {currentFileType === "All"
                                  ? "Todos los archivos"
                                  : currentFileType === "Image"
                                  ? "Imágenes"
                                  : currentFileType === "Video"
                                  ? "Videos"
                                  : currentFileType === "Audio"
                                  ? "Audio"
                                  : "Otros"}
                                {favorites ? " (Favoritos)" : ""}
                              </h2>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {filteredFiles.length} archivos •{" "}
                              {filteredFolders.length} carpetas
                            </div>
                          </div>
                        </div>
                      </div>
                      {viewMode === "grid" && (
                        <FileGrid
                          files={favorites ? favoriteFiles : filteredFiles}
                          gridSize={gridSize}
                          fileType={currentFileType}
                          fetchComplete={fetchComplete}
                          fetchData={fetchData}
                          folders={filteredFolders}
                          updateCurrentFolder={updateCurrentFolder}
                          currentFolder={currentFolder}
                        />
                      )}

                      {viewMode === "turntable" && (
                        <FileTurntable
                          files={favorites ? favoriteFiles : filteredFiles}
                          fileType={currentFileType}
                          fetchComplete={fetchComplete}
                          fetchData={fetchData}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Header */}
            <div className="flex w-full items-center justify-between p-4">
              <div className="flex items-center">
                <Button
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => {
                    setIsLoaded(false);
                    setTimeout(() => {
                      router.push("/main");
                    }, 500);
                  }}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Menu
                </Button>
                <ViewModeNav
                  viewMode={viewMode}
                  setViewMode={(mode) => {
                    fetchData();
                    setViewMode(mode);
                  }}
                  currentFileType={currentFileType}
                />
              </div>
              <CreateNew
                fetchData={fetchData}
                createFolder={createFolder}
                currentFolder={currentFolder}
              />
            </div>

            <FolderSystem
              updateCurrentFolder={updateCurrentFolder}
              currentFolder={currentFolder}
              viewMode={viewMode}
            />

            <main
              className={`flex-1 p-4 bg-background ${
                isDesktop ? "overflow-auto relative" : ""
              }`}
            >
              <AnimatePresence>
                {(!isRendered || !fetchComplete) && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { delay: 0 } }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    className="text-foreground text-center font-bold flex items-center justify-center flex-col space-y-10 min-h-[70dvh] w-full absolute inset-0 transform"
                    style={{ fontFamily: code.style.fontFamily }}
                  >
                    <p className="text-3xl">
                      {!isRendered ? "Cargando..." : "Buscando..."}
                    </p>
                    {!isRendered ? (
                      <LoaderCircle className="animate-spin" size={50} />
                    ) : (
                      <Search size={50} />
                    )}
                  </motion.div>
                )}

                {isRendered && (
                  <motion.div
                    key={viewMode + currentFileType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full mt-5"
                  >
                    {viewMode === "grid" && (
                      <FileGrid
                        files={favorites ? favoriteFiles : filteredFiles}
                        fileType={currentFileType}
                        fetchComplete={fetchComplete}
                        fetchData={fetchData}
                        folders={filteredFolders}
                        updateCurrentFolder={updateCurrentFolder}
                        currentFolder={currentFolder}
                        gridSize={gridSize}
                      />
                    )}

                    {viewMode === "turntable" && (
                      <FileTurntable
                        files={favorites ? favoriteFiles : filteredFiles}
                        fileType={currentFileType}
                        fetchComplete={fetchComplete}
                        fetchData={fetchData}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <BottomNav
              currentFileType={currentFileType}
              setCurrentFileType={setCurrentFileType}
              fetchData={fetchData}
              setViewMode={setViewMode}
            />
          </>
        )}
      </div>
    </>
  );
}
