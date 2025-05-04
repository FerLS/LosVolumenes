"use client";
import { code, Defectica } from "../fonts/fonts";
import {
  BookMarked,
  CassetteTape,
  FilmIcon,
  Images,
  Music,
  Home,
  Upload,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import LazyLoad from "../components/Stats/LazyLoad";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Courtain from "../components/Courtain";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { NumberTicker } from "@/components/magicui/number-ticker";
import FileStatsDashboard from "../components/Stats/SimpleFileChart";
import SimpleFileChart from "../components/Stats/SimpleFileChart";

const PieStats = React.lazy(() => import("../components/Stats/PieStats"));
const PieGB = React.lazy(() => import("../components/Stats/PieGB"));

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
export default function Main() {
  const [initialMessageOpen, setInitialMessageOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const hasSeenMessage = localStorage.getItem("hasSeenMessage");
    if (hasSeenMessage) {
      setInitialMessageOpen(false);
    }

    // Check if we're on mobile or desktop
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCloseMessage = () => {
    localStorage.setItem("hasSeenMessage", "true");
    setInitialMessageOpen(false);
  };
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const router = useRouter();

  const [fileStats, setFileStats] = useState({
    totalFiles: 0,
    totalSizeInMb: 0,
    typeStats: {
      Image: 0,
      video: 0,
      Audio: 0,
      Other: 0,
    },
  });

  // Update the useEffect that fetches space to also fetch file stats
  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const response = await axios.get("/api/files?stats=true");
        if (response.status === 200) {
          const data = response.data;
          // Convert MB to GB with 2 decimal places

          // Update file stats
          setFileStats({
            totalFiles: data.totalFiles,
            totalSizeInMb: data.totalSizeInMb,
            typeStats: data.typeStats,
          });
          setRecentFiles(
            data.recentFiles.slice(0, 3).map((file: any) => {
              const fileName = file.url.split("/").pop() || "";
              const nameWithoutDash = fileName.includes("-")
                ? fileName.substring(fileName.indexOf("-") + 1, fileName.length)
                : fileName;

              return {
                name: nameWithoutDash,
                type: file.type,
                date: file.date,
              };
            })
          );
        } else {
          console.error("Error fetching space:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching space:", error);
      }
    };
    fetchSpace();
  }, []);

  // Navigation handler
  const navigateTo = (type: string, favorites?: boolean, fileName?: string) => {
    setIsLoaded(false);
    setTimeout(() => {
      if (favorites) {
        router.push(`/cloud?type=All&favorites=true`);
      } else if (fileName) {
        router.push(`/cloud?type=${type}&search=${fileName}`);
      } else {
        router.push(`/cloud?type=${type}`);
      }
    }, 500);
  };

  // Sample recent files data
  interface RecentFile {
    name: string;
    type: string;
    date: string;
  }

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  return (
    <main
      className="w-screen min-h-screen h-screen bg-background md:overflow-hidden flex flex-col md:flex-row "
      style={{ fontFamily: code.style.fontFamily }}
    >
      <Courtain isLoaded={isLoaded}></Courtain>

      {/* Desktop Sidebar - Only visible on md and up */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-gradient-to-b md:from-[hsl(var(--surface-2))] md:to-[hsl(var(--surface-2)/0.95)] md:h-screen md:p-6 md:border-r md:border-border md:shadow-md">
        <div className="flex items-center gap-3 mb-10">
          <CassetteTape size={32} className="text-primary" />
          <h1 className="text-xl font-bold text-foreground">Los Volumenes</h1>
        </div>

        <div className="space-y-1 mb-8">
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("All")}
          >
            <CassetteTape className="mr-2 h-5 w-5" />
            Explorar Todo
          </Button>
          <Separator className="my-2 bg-border" />
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("Image")}
          >
            <Images className="mr-2 h-5 w-5" />
            Imágenes
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("video")}
          >
            <FilmIcon className="mr-2 h-5 w-5" />
            Videos
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("Audio")}
          >
            <Music className="mr-2 h-5 w-5" />
            Audio
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("Other")}
          >
            <BookMarked className="mr-2 h-5 w-5" />
            Otros
          </Button>
        </div>

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
            onClick={() => navigateTo("All", true)}
          >
            <Star className="mr-2 h-5 w-5" />
            Favoritos
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
          >
            <Settings className="mr-2 h-5 w-5" />
            Ajustes
          </Button>
        </div>

        <div className="mt-auto">
          <div className="bg-gradient-to-br from-card to-[hsl(var(--card)/0.9)] rounded-lg p-4 mb-6 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Ocupado</span>
              <span className="text-xs text-primary">
                {parseFloat(fileStats.totalSizeInMb.toFixed(1))} GB /{" "}
                {parseInt(process.env.NEXT_PUBLIC_MAX_SIZE || "5120") / 1024} GB
              </span>
            </div>
            <Progress
              value={(fileStats.totalSizeInMb / 30) * 100}
              className="h-2 bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Mobile and Desktop Content Area */}
      <div className="flex-1 flex flex-col h-screen md:overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        {isMobile && (
          <div className="w-full p-10 text-4xl text-foreground justify-between flex flex-col bg-background">
            <h1 style={{ fontFamily: Defectica.style.fontFamily }}>
              Bienvenido a
              <br />
              <span
                className="font-bold text-4xl text-primary"
                style={{ fontFamily: code.style.fontFamily }}
              >
                Los Volumenes!
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-xl">
              Este espacio lo podras usar para guardar todo aquello que quieras.
            </p>
          </div>
        )}

        {/* Desktop Header - Only visible on desktop */}
        <div className="hidden md:flex md:items-center md:justify-between md:p-6 md:bg-gradient-to-r md:from-[hsl(var(--surface-2)/0.7)] md:to-[hsl(var(--surface-2)/0.3)] md:border-b md:border-border md:backdrop-blur-sm">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const searchValue = (e.target as HTMLFormElement).search.value;
                if (searchValue) {
                  navigateTo("All", searchValue);
                }
              }}
              className="flex items-center"
            >
              <Input
                id="search"
                placeholder="Buscar archivos..."
                className="pl-8 bg-[hsl(var(--surface-3))] border-none text-foreground focus-visible:ring-primary focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="ml-2"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.documentElement.classList.toggle("dark")}
              title="Toggle theme"
              className="border-none bg-[hsl(var(--surface-3))] mr-2 hidden"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                if (!document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.add('dark')
                }
              `,
              }}
            ></script>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-primary transition-colors cursor-pointer">
            <Avatar className="h-8 w-8 bg-primary shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Usuario</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ y: isMobile ? -100 : 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`
            flex-1 md:overflow-y-auto
            ${
              isMobile
                ? "bg-gradient-to-b from-card to-[hsl(var(--card)/0.95)] rounded-t-[2rem] p-8 shadow-lg shadow-primary/5"
                : "bg-background p-6 "
            }
          `}
        >
          {!isMobile && (
            <div className="w-full h-6 -translate-y-6 fixed from-background to-background/0  bg-gradient-to-b z-20"></div>
          )}
          {/* Desktop Welcome Section - Only visible on desktop */}
          {!isMobile && (
            <div className="mb-8 ">
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Bienvenido a{" "}
                <span className="text-primary">Los Volumenes!</span>
              </h1>
              <p className="text-muted-foreground">
                Este espacio lo podras usar para guardar todo aquello que
                quieras.
              </p>
            </div>
          )}

          {/* Drive Section */}
          <div className="flex space-x-5 items-center max-w-full w-full md:mb-6">
            <h2 className="text-xl font-bold text-foreground">Categorías</h2>
            <Separator className="grow w-fit bg-border"></Separator>
          </div>

          {/* Mobile Drive Navigation */}
          {isMobile && (
            <div className="flex flex-col w-full space-y-4 mt-5">
              <div
                className="w-full bg-gradient-to-r from-secondary to-[hsl(var(--secondary)/0.8)] rounded-2xl flex items-center p-5 space-x-2 justify-between hover:bg-accent transition-all hover:shadow-md hover:shadow-primary/10 cursor-pointer"
                onClick={() => navigateTo("All")}
              >
                <p className="text-xl text-foreground">Ir al Archivo</p>
                <CassetteTape size={30} className="text-primary"></CassetteTape>
              </div>

              <div className="flex w-full space-x-4">
                <div
                  className="bg-gradient-to-br from-secondary to-[hsl(var(--chart-1)/0.15)] rounded-2xl grow flex items-center justify-center p-4 transition-colors cursor-pointer"
                  onClick={() => navigateTo("Image")}
                >
                  <Images size={30} className="text-foreground"></Images>
                </div>
                <div
                  className="bg-gradient-to-br from-secondary to-[hsl(var(--chart-2)/0.15)] rounded-2xl grow flex items-center justify-center p-4 transition-colors cursor-pointer"
                  onClick={() => navigateTo("video")}
                >
                  <FilmIcon size={30} className="text-foreground"></FilmIcon>
                </div>
                <div
                  className="bg-gradient-to-br from-secondary to-[hsl(var(--chart-3)/0.15)] rounded-2xl grow flex items-center justify-center p-4 transition-colors cursor-pointer"
                  onClick={() => navigateTo("Audio")}
                >
                  <Music size={30} className="text-foreground"></Music>
                </div>
                <div
                  className="bg-gradient-to-br from-secondary to-[hsl(var(--chart-4)/0.15)] rounded-2xl grow flex items-center justify-center p-4 transition-colors cursor-pointer"
                  onClick={() => navigateTo("Other")}
                >
                  <BookMarked
                    size={30}
                    className="text-foreground"
                  ></BookMarked>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Drive Cards */}
          {!isMobile && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div
                className={`bg-secondary rounded-xl p-6 border border-border transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] bg-gradient-to-br ${getFileTypeGradient(
                  "Image"
                )} h-44`}
                onClick={() => navigateTo("Image")}
              >
                <div className="flex justify-between items-start mb-4">
                  <Images size={32} className="text-foreground" />
                  <span className="text-xs font-medium bg-[hsl(var(--chart-1)/0.3)] px-2 py-1 rounded-full text-foreground">
                    <NumberTicker value={fileStats.typeStats.Image ?? 0} />
                    {" archivos"}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-auto text-foreground">
                  Imágenes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fotos, ilustraciones y más
                </p>
                <div className="flex justify-end mt-2">
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </div>

              <div
                className={`bg-secondary rounded-xl p-6 border border-border transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] bg-gradient-to-br ${getFileTypeGradient(
                  "Video"
                )} h-44`}
                onClick={() => navigateTo("video")}
              >
                <div className="flex justify-between items-start mb-4 ">
                  <FilmIcon size={32} className="text-foreground" />
                  <span className="text-xs font-medium bg-[hsl(var(--chart-2)/0.3)] px-2 py-1 rounded-full text-foreground">
                    <NumberTicker value={fileStats.typeStats.video ?? 0} />
                    {" archivos"}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-auto text-foreground">
                  Videos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clips, películas y grabaciones
                </p>
                <div className="flex justify-end mt-2">
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </div>

              <div
                className={`bg-secondary rounded-xl p-6 border border-border transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] bg-gradient-to-br ${getFileTypeGradient(
                  "Audio"
                )} h-44`}
                onClick={() => navigateTo("Audio")}
              >
                <div className="flex justify-between items-start mb-4">
                  <Music size={32} className="text-foreground" />
                  <span className="text-xs font-medium bg-[hsl(var(--chart-3)/0.3)] px-2 py-1 rounded-full text-foreground">
                    <NumberTicker value={fileStats.typeStats.Audio ?? 0} />
                    {" archivos"}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-auto text-foreground">
                  Audio
                </h3>
                <p className="text-sm text-muted-foreground">
                  Música, grabaciones y sonidos
                </p>
                <div className="flex justify-end mt-2">
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </div>

              <div
                className={`bg-secondary rounded-xl p-6 border border-border transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] bg-gradient-to-br ${getFileTypeGradient(
                  "Other"
                )} h-44`}
                onClick={() => navigateTo("Other")}
              >
                <div className="flex justify-between items-start mb-4">
                  <BookMarked size={32} className="text-foreground" />
                  <span className="text-xs font-medium bg-[hsl(var(--chart-4)/0.3)] px-2 py-1 rounded-full text-foreground">
                    <NumberTicker value={fileStats.typeStats.Other ?? 0} />
                    {" archivos"}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-auto text-foreground">
                  Otros
                </h3>
                <p className="text-sm text-muted-foreground">
                  Documentos, PDFs y más
                </p>
                <div className="flex justify-end mt-2">
                  <ChevronRight size={20} className="text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* Recent Files Section - Desktop Only */}
          {!isMobile && (
            <>
              <div className="flex space-x-5 items-center max-w-full w-full mt-10">
                <h2 className="text-xl font-bold text-foreground">
                  Archivos Recientes
                </h2>
                <Separator className="grow w-fit bg-border"></Separator>
              </div>

              <div className="mt-4 bg-gradient-to-br from-card to-[hsl(var(--card)/0.9)] rounded-xl overflow-hidden border border-border shadow-sm">
                <div className="grid grid-cols-3 p-3 text-sm font-medium text-muted-foreground border-b border-border">
                  <div>Nombre</div>
                  <div>Tipo</div>
                  <div>Fecha</div>
                </div>
                {recentFiles.length > 0 ? (
                  recentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 p-3 hover:bg-accent hover:text-primary transition-colors cursor-pointer text-foreground"
                      onClick={() => navigateTo(file.type, false, file.name)}
                    >
                      <div className="flex items-center gap-2">
                        {file.type === "Image" && (
                          <Images
                            size={16}
                            className="text-[hsl(var(--chart-1))]"
                          />
                        )}
                        {file.type === "video" && (
                          <FilmIcon
                            size={16}
                            className="text-[hsl(var(--chart-2))]"
                          />
                        )}
                        {file.type === "Audio" && (
                          <Music
                            size={16}
                            className="text-[hsl(var(--chart-3))]"
                          />
                        )}
                        {file.type === "Other" && (
                          <BookMarked
                            size={16}
                            className="text-[hsl(var(--chart-4))]"
                          />
                        )}
                        <span className="truncate max-w-80">{file.name}</span>
                      </div>
                      <div>{file.type}</div>
                      <div className="text-muted-foreground">{file.date}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No hay archivos recientes
                  </div>
                )}
              </div>
            </>
          )}

          {/* Archive Button - Desktop Only */}
          {!isMobile && (
            <div
              className="mt-8 bg-gradient-to-r from-secondary to-[hsl(var(--secondary)/0.8)] rounded-xl p-6 hover:bg-accent transition-all hover:shadow-md hover:shadow-primary/10 cursor-pointer border border-border"
              onClick={() => navigateTo("All")}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Explorar Todo el Archivo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Accede a todos tus archivos en un solo lugar
                  </p>
                </div>
                <CassetteTape size={40} className="text-primary" />
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="flex space-x-5 items-center max-w-full w-full mt-10">
            <h2 className="text-xl font-bold text-foreground">Estadísticas</h2>
            <Separator className="grow w-fit bg-border"></Separator>
          </div>

          {/* Stats Content */}
          <div
            className={`
            flex flex-col w-full space-y-4 pb-10 mt-5
            md:grid md:grid-cols-2 md:gap-8 md:space-y-0 md:mt-6
          `}
          >
            <LazyLoad>
              <React.Suspense
                fallback={<Skeleton className="flex rounded-xl h-96" />}
              >
                <div className="bg-card rounded-xl p-6 border border-border shadow-md shadow-primary/5">
                  <PieStats></PieStats>
                </div>
              </React.Suspense>
            </LazyLoad>
            <LazyLoad>
              <React.Suspense
                fallback={<Skeleton className="flex rounded-xl h-96" />}
              >
                <div className="bg-card rounded-xl p-6 border border-border shadow-md shadow-primary/5">
                  <SimpleFileChart></SimpleFileChart>
                </div>
              </React.Suspense>
            </LazyLoad>
          </div>
        </motion.div>
      </div>

      <AlertDialog open={initialMessageOpen}>
        <AlertDialogContent
          className="w-[90%] rounded-2xl max-h-[70%] overflow-y-scroll md:max-w-2xl md:max-h-[80%] bg-gradient-to-br from-card to-[hsl(var(--card)/0.95)] text-foreground border border-border shadow-lg"
          style={{ fontFamily: code.style.fontFamily }}
        >
          <p>
            Bienvenido a Los Volumenes, una demo interactiva de almacenamiento
            en la nube.
            <br />
            <br />
            Esta es una versión de demostración donde podrás explorar la
            interfaz y navegar por el contenido, pero no podrás subir archivos
            nuevos. La aplicación te permite visualizar cómo sería una
            plataforma de almacenamiento personal con diferentes categorías para
            tus archivos.
            <br />
            <br />
            Puedes navegar entre las diferentes secciones, ver las estadísticas
            y explorar la organización de archivos por categorías como imágenes,
            videos, audio y documentos.
            <br />
            <br />
            Esta demo es solo para fines de visualización y evaluación de la
            interfaz de usuario.
            <br />
            <br />
            <span className="opacity-50">
              Nota: Todas las funcionalidades de carga y modificación de
              archivos están deshabilitadas en esta versión de demostración.
            </span>
          </p>
          <AlertDialogCancel asChild>
            <Button
              onClick={() => handleCloseMessage()}
              className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-md hover:shadow-lg transition-all"
            >
              Entrar
            </Button>
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
