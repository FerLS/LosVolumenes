"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PenTool, Triangle } from "lucide-react";
import Image from "next/image";
import type { CustomFile } from "@/app/types/File";
import FileDrawer from "./FileDrawer";
import { code } from "../fonts/fonts";
import VideoThumbnail from "./VideoThumbnail";
import { useMediaQuery } from "react-responsive";

interface FileTurntableProps {
  files: CustomFile[];
  fileType: string;
  fetchComplete: boolean;
  fetchData: Function;
}

export default function FileTurntable({
  files,
  fileType,
  fetchComplete,
  fetchData,
}: FileTurntableProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const filteredFiles = files.filter(
    (file) => file.type === fileType || fileType === "All"
  );

  return (
    <AnimatePresence>
      {filteredFiles.length === 0 && fetchComplete ? (
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
        <div
          className={`flex ${
            isDesktop
              ? "flex-row flex-wrap justify-center gap-8"
              : "flex-col items-center justify-start"
          } w-full h-full ${
            fileType === "Image"
              ? isDesktop
                ? ""
                : "-space-y-40"
              : fileType === "Audio"
              ? isDesktop
                ? ""
                : "-space-y-20"
              : fileType === "Video"
              ? isDesktop
                ? ""
                : "space-y-10"
              : "space-y-0"
          } min-h-[80dvh] mt-10`}
        >
          {fetchComplete &&
            filteredFiles.map((file, index) => (
              <>
                {fileType === "Image" ? (
                  <motion.div
                    key={file.url}
                    initial={{ opacity: 0, y: 20, rotate: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: 5 * (index % (index % 3) === 0 ? -1 : 1),
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1 - index * 0.05,
                    }}
                    className={`relative ${
                      isDesktop ? "w-[300px] h-[380px]" : "w-[35vh] h-[45vh]"
                    } bg-white flex p-6 items-start transition-all`}
                    style={{ boxShadow: "0 -20px 20px rgba(0, 0, 0, 0.4)" }}
                    whileTap={{ zIndex: 40, translateY: -20 }}
                    onClick={() => (drawerOpen ? null : setDrawerOpen(true))}
                  >
                    <FileDrawer
                      files={filteredFiles}
                      initialIndex={index}
                      fetchData={fetchData}
                      setDrawerOpen={setDrawerOpen}
                      isSelecting={false}
                    />

                    <div className="aspect-square relative w-full">
                      <Image
                        src={`/api/file?url=${file.url}`}
                        alt="File"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </motion.div>
                ) : fileType === "Video" ? (
                  <motion.div
                    key={file.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1 - index * 0.05,
                    }}
                    className={`relative ${
                      isDesktop ? "w-[400px] h-[250px]" : "w-[35vh] h-[25vh]"
                    } bg-primary flex items-center justify-between overflow-hidden py-5`}
                    whileTap={{ zIndex: 40, translateY: -20 }}
                    onClick={() => (drawerOpen ? null : setDrawerOpen(true))}
                  >
                    <FileDrawer
                      files={filteredFiles}
                      initialIndex={index}
                      fetchData={fetchData}
                      setDrawerOpen={setDrawerOpen}
                      isSelecting={false}
                    />

                    <div className="space-y-5 w-20 flex flex-col justify-between items-start z-10">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-r-full w-12 h-12 bg-primary`}
                        />
                      ))}
                    </div>
                    <VideoThumbnail videoUrl={`/api/file?url=${file.url}`} />

                    <div className="space-y-5 w-20 flex flex-col justify-between items-end z-10">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-l-full w-12 h-12 bg-primary`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : fileType === "Audio" ? (
                  <motion.div
                    key={file.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1 - index * 0.05,
                      y: {
                        duration: 10,
                        type: "spring",
                        stiffness: 1000,
                        delay: index * 0.1 - index * 0.05,
                        damping: 20,
                      },
                    }}
                    className={`relative ${
                      isDesktop ? "w-[350px] h-[200px]" : "w-[35vh] h-[25vh]"
                    } bg-primary flex p-6 items-center justify-center flex-col`}
                    style={{ boxShadow: "0 -20px 20px rgba(0, 0, 0, 0.4)" }}
                    whileTap={{ zIndex: 40, translateY: -20 }}
                    onClick={() => (drawerOpen ? null : setDrawerOpen(true))}
                  >
                    <FileDrawer
                      files={filteredFiles}
                      initialIndex={index}
                      fetchData={fetchData}
                      setDrawerOpen={setDrawerOpen}
                      isSelecting={false}
                    />
                    <p
                      className="text-center h-10 w-[80%] overflow-hidden text-black whitespace-nowrap overflow-ellipsis font-bold"
                      style={{ fontFamily: code.style.fontFamily }}
                    >
                      {file.url.split("-").pop()}
                    </p>
                    <div className="flex items-center justify-center space-x-5 w-full h-full">
                      <div className="rounded-full w-12 h-12 bg-secondary" />
                      <div className="w-20 h-12 bg-white" />
                      <div className="rounded-full w-12 h-12 bg-secondary" />
                    </div>
                    <div className="absolute -bottom-1 h-10 bg-background w-[40%] flex justify-between rounded-t-xl">
                      <Triangle
                        size={50}
                        className="fill-background -translate-x-[19px] -translate-y-1"
                        strokeWidth={0}
                      ></Triangle>
                      <Triangle
                        size={50}
                        className="fill-background translate-x-[19px] -translate-y-1"
                        strokeWidth={0}
                      ></Triangle>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={file.url}
                    initial={{ opacity: 0, y: 20, rotateZ: -5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotateZ: index % 2 === 0 ? 3 : -3,
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotateZ: 0,
                      transition: { duration: 0.1, delay: 0 },
                    }}
                    whileTap={{
                      scale: 0.95,
                      zIndex: 40,
                      transition: { duration: 0.1, delay: 0 },
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      restDelta: 0.001,
                      damping: 15,
                    }}
                    className={`relative ${
                      isDesktop ? "w-[300px] h-[200px]" : "w-[35vh] h-[20vh]"
                    } bg-gradient-to-br from-secondary/80 to-primary/60 backdrop-blur-sm flex p-6 items-center justify-center overflow-hidden border-t-4 border-foreground/20 rounded-sm`}
                    style={{ boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)" }}
                    onClick={() => (drawerOpen ? null : setDrawerOpen(true))}
                  >
                    <FileDrawer
                      files={filteredFiles}
                      initialIndex={index}
                      fetchData={fetchData}
                      setDrawerOpen={setDrawerOpen}
                      isSelecting={false}
                    />
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-secondary/20 -skew-y-12 transform origin-left" />
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-foreground/10" />
                    <div className="flex flex-col items-center justify-center z-10 gap-3">
                      <div className="text-center px-2 py-1 bg-background/70 rounded-sm">
                        <p
                          className="font-bold tracking-tight"
                          style={{ fontFamily: code.style.fontFamily }}
                        >
                          {file.url.split("-").pop()?.substring(0, 20)}
                          {(file.url.split("-").pop() ?? "").length > 20
                            ? "..."
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-xs opacity-70">
                          {file.type || "Document"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ))}
        </div>
      )}
    </AnimatePresence>
  );
}

const bounce = {
  duration: 1.2,
  ease: bounceEase,
};

// From https://easings.net/#easeOutBounce
function bounceEase(x: any) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}
