import { useEffect, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Función para generar el thumbnail
function generateThumbnail(videoSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      reject("No se pudo obtener el contexto del canvas");
      return;
    }

    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0;

      video.addEventListener("seeked", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataURL = canvas.toDataURL("image/png");
        resolve(thumbnailDataURL);
      });
    });

    video.addEventListener("error", (err) => {
      reject(`Error al cargar el video: ${err.message}`);
    });
  });
}

// Componente
export default function VideoThumbnail({
  videoUrl,
  onMoving,
}: {
  videoUrl: string;
  onMoving?: boolean;
}) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    // Generar el thumbnail al montar el componente
    generateThumbnail(videoUrl)
      .then((thumbnailUrl) => setThumbnail(thumbnailUrl))
      .catch((error) => console.error("Error generando thumbnail:", error));
  }, [videoUrl]);

  return (
    <>
      {thumbnail ? (
        <Image
          src={thumbnail} // Thumbnail generado
          alt="Video Thumbnail"
          fill
          style={{ objectFit: "cover" }}
          className={`scale-105 ${onMoving ? "opacity-40" : ""}`}
        />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </>
  );
}
