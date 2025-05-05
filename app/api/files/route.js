import connectToDatabase from "@/lib/mongodb";
import File from "@/models/file";
import fs from "fs/promises";
import path from "path";
import EXIF from "exif-js";
import axios from "axios";
import exifr from "exifr";
import { promises as fsPromises } from "fs";

// En la función listFilesFromDemo
async function listFilesFromDemo(directoryPath) {
  try {
    // Extraer la ruta después de "uploads/"
    const relativePath = directoryPath.replace(/^uploads\//, "");
    const fullDemoPath = path.join(
      process.cwd(),
      "public",
      "DriveDemo",
      relativePath
    );

    console.log("Listando archivos de:", fullDemoPath);

    // Leer el directorio
    const items = await fsPromises.readdir(fullDemoPath, {
      withFileTypes: true,
    });

    // Filtrar solo archivos (no directorios)
    const files = items.filter((item) => item.isFile());

    // Convertir a formato esperado
    const result = [];
    for (const file of files) {
      const fileStat = await fsPromises.stat(
        path.join(fullDemoPath, file.name)
      );
      const fileSizeInKB = Math.round(fileStat.size / 1024);

      // URL relativa para acceder al archivo desde el navegador
      const publicUrl = `${relativePath}/${file.name}`;

      result.push({
        name: file.name,
        type: getFileType(file.name),
        size: fileSizeInKB,
        sizeFormatted: `${fileSizeInKB} KB`,
        location: "Demo",
        date: fileStat.mtime.toISOString(),
        url: publicUrl,
        metadata: {
          name: file.name,
          mimeType: getMimeType(file.name),
          extension: path.extname(file.name),
        },
        favorite: false,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching demo files:", error);
    return []; // Return empty array in case of error
  }
}

// También actualiza la función getAllDemoFiles de manera similar

// Helper function to determine file type
function getFileType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext))
    return "Image";
  if ([".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext))
    return "Video";
  if ([".mp3", ".wav", ".ogg", ".flac", ".aac"].includes(ext)) return "Audio";
  return "Other";
}

// Helper function to determine MIME type
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    // Add more as needed
  };
  return mimeTypes[ext] || "application/octet-stream";
}

const extractMetadata = async (filePath) => {
  try {
    const metadata = await exifr.parse(filePath);
    return metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {};
  }
};

import locationiq from "@api/locationiq";
const obtenerUbicacion = async (latitud, longitud) => {
  console.log(
    convertToDecimalDegrees(latitud[0], latitud[1], latitud[2]),
    convertToDecimalDegrees(longitud[0], longitud[1], longitud[2])
  );

  try {
    locationiq.auth("pk.8bc1bf5508eba6a60cc1544c30ebe8d3");
    locationiq.server("https://eu1.locationiq.com/v1");
    const response = await locationiq.reverse({
      lat: convertToDecimalDegrees(latitud[0], latitud[1], latitud[2]),
      lon: convertToDecimalDegrees(longitud[0], longitud[1], longitud[2]),
      format: "json",
      zoom: "10",
      "accept-language": "es",
    });
    return response.data.display_name;
  } catch (err) {
    console.error(err);
    return "Unknown location";
  }
};
const convertToDecimalDegrees = (degrees, minutes, seconds) => {
  return degrees + minutes / 60 + seconds / 3600;
};
export async function POST(request) {
  try {
    // Check if in demo mode - prevent file uploads
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({ message: "File uploads not allowed in demo mode" }),
        { status: 403 }
      );
    }

    await connectToDatabase();

    const formData = await request.formData();
    const files = formData.getAll("files");
    const url_path = formData.get("path");

    // Improved space calculation with consistent units
    const totalSize = files.reduce(
      (acc, file) => acc + Number(file.size || 0),
      0
    );
    const totalSizeInKB = totalSize / 1024;

    const FilesInDisk = await File.find();

    // Fix size calculation from database - extract numbers only
    const totalSizeInDisk = FilesInDisk.reduce((acc, file) => {
      // Extract numeric part if stored as string with units (e.g., "123 KB")
      const sizeValue =
        typeof file.size === "string"
          ? parseInt(file.size.replace(/[^\d.-]/g, ""))
          : Number(file.size || 0);
      return acc + sizeValue;
    }, 0);

    const spaceLimit = 30 * 1024 * 1024; // 30 GB in KB (30 * 1024 * 1024 KB)

    const spaceAvailable = spaceLimit - totalSizeInDisk;

    // Log sizes for debugging
    console.log({
      fileSize: totalSizeInKB + " KB",
      diskUsage: totalSizeInDisk + " KB",
      available: spaceAvailable + " KB",
    });

    if (totalSizeInKB >= spaceAvailable) {
      return new Response(
        JSON.stringify({
          message: "No space available",
          details: {
            fileSize: Math.round(totalSizeInKB),
            available: Math.round(spaceAvailable),
            unit: "KB",
          },
        }),
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ message: "No files uploaded" }), {
        status: 400,
      });
    }

    const uploadDir = path.join(process.cwd(), "uploads", url_path || "drive");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];
    const file = files[0]; // Process just one file

    try {
      // Improved MIME type detection for GLB files
      const mimeType = file.type || "application/octet-stream";

      // Get file buffer with size limit handling
      let buffer;
      try {
        buffer = await file.arrayBuffer();
      } catch (bufferError) {
        console.error("Buffer error:", bufferError);
        return new Response(
          JSON.stringify({
            message: "File too large to process",
            error: bufferError.message,
          }),
          { status: 413 }
        );
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, Buffer.from(buffer));

      let fileType = "Other";
      if (file.type.startsWith("image")) {
        fileType = "Image";
      } else if (file.type.startsWith("video")) {
        fileType = "Video";
      } else if (file.type.startsWith("audio")) {
        fileType = "Audio";
      } else {
        fileType = "Other";
      }

      let location = "Unknown";
      let date = new Date().toLocaleDateString() || "Unknown";

      // Extraer metadata EXIF si es una imagen - with timeout
      if (file.type.startsWith("image/jpeg")) {
        try {
          // Add timeout for EXIF extraction
          const exifPromise = extractMetadata(filePath);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("EXIF timeout")), 3000)
          );

          const exifMetadata = await Promise.race([
            exifPromise,
            timeoutPromise,
          ]);

          if (exifMetadata?.GPSLatitude && exifMetadata?.GPSLongitude) {
            // Add timeout for location lookup
            const locationPromise = obtenerUbicacion(
              exifMetadata.GPSLatitude,
              exifMetadata.GPSLongitude
            );
            const locationTimeoutPromise = new Promise((resolve) =>
              setTimeout(() => resolve("Unknown location"), 3000)
            );

            location = await Promise.race([
              locationPromise,
              locationTimeoutPromise,
            ]);
          }

          if (exifMetadata) {
            date =
              exifMetadata.DateTime ||
              exifMetadata.DateTimeOriginal ||
              exifMetadata.DateTimeDigitized ||
              exifMetadata.CreateDate ||
              date;
          }
        } catch (error) {
          console.error("Error processing EXIF:", error);
        }
      }

      // Replace calculation of file size to ensure consistency
      const fileSizeInKB = Math.round(file.size / 1024);

      const newFile = new File({
        name: file.name,
        type: fileType,
        size: fileSizeInKB, // Store as number for easier calculations
        sizeFormatted: `${fileSizeInKB} KB`, // Store formatted string separately
        location: location,
        date: date,
        url: `${url_path || "drive"}/${fileName}`,
        metadata: {
          name: file.name,
          mimeType: mimeType,
          extension: path.extname(fileName),
        },
      });

      await newFile.save();
      uploadedFiles.push(newFile);

      return new Response(
        JSON.stringify({
          message: "File uploaded successfully",
          file: newFile,
        }),
        { status: 201 }
      );
    } catch (error) {
      // More detailed error handling
      console.error("Error processing file:", error);
      return new Response(
        JSON.stringify({
          message: "File upload failed",
          error: error.message,
          fileName: file.name,
          fileType: file.type,
          fileSize: `${Math.round(file.size / 1024)} KB`,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing file upload:", error);
    return new Response(
      JSON.stringify({ message: "File upload failed", error: error.message }),
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    // Check if in demo mode - prevent modifications
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({
          message: "File modifications not allowed in demo mode",
        }),
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { urls, newUrl, rename } = await request.json();

    if (!urls || urls.length === 0) {
      return new Response(
        JSON.stringify({ message: "Updates array is required" }),
        {
          status: 400,
        }
      );
    }

    const updatedFiles = [];

    for (const url of urls) {
      if (!url) {
        continue;
      }

      const file = await File.findOne({ url });

      if (!file) {
        continue;
      }

      file.url =
        newUrl +
        (rename ? "." + url.split(".").pop() : "/" + url.split("/").pop());

      //Move file to new location
      const oldFilePath = path.join(process.cwd(), "uploads", url);
      const newFilePath = path.join(
        process.cwd(),
        "uploads",
        newUrl +
          (rename ? "." + url.split(".").pop() : "/" + url.split("/").pop())
      );
      await fs.rename(oldFilePath, newFilePath);

      await file.save();
      updatedFiles.push(file);
    }

    if (updatedFiles.length === 0) {
      return new Response(JSON.stringify({ message: "No files updated" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Files updated successfully",
        files: updatedFiles,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating files:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to update files",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";

    if (isDemo) {
      const url = new URL(request.url);
      const type = url.searchParams.get("type");
      const pathParam = url.searchParams.get("path") || "drive";
      const stats = url.searchParams.get("stats");

      // Path for the demo folder
      const directoryPath = `uploads/${pathParam}`;

      try {
        // For stats request in demo mode
        if (stats) {
          // Get all files recursively for stats
          const allFiles = await getAllDemoFiles("drive");

          const totalFiles = allFiles.length;
          const totalSize = allFiles.reduce(
            (acc, file) => acc + (file.size || 0),
            0
          );
          const totalSizeInMb = totalSize / 1024;

          // Calculate type stats
          const typeStats = allFiles.reduce((acc, file) => {
            acc[file.type] = (acc[file.type] || 0) + 1;
            return acc;
          }, {});

          // Get recent files sorted by date
          const recentFiles = [...allFiles]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

          return new Response(
            JSON.stringify({
              totalFiles,
              totalSizeInMb,
              typeStats,
              recentFiles,
            }),
            { status: 200 }
          );
        }

        // Get files from the demo folder
        const demoFiles = await listFilesFromDemo(directoryPath);

        // Apply filters similar to the database query
        const filteredFiles =
          type && type !== "All"
            ? demoFiles.filter((file) => file.type === type)
            : demoFiles;

        return new Response(JSON.stringify(filteredFiles), { status: 200 });
      } catch (error) {
        console.error("Demo files error:", error);
        return new Response(
          JSON.stringify({
            message: "Failed to fetch demo files",
            error: error.message,
          }),
          { status: 500 }
        );
      }
    }

    // Non-demo mode: use existing database code
    await connectToDatabase();
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const path = url.searchParams.get("path");
    const stats = url.searchParams.get("stats");

    if (stats) {
      const files = await File.find();
      const totalFiles = files.length;
      const totalSize = files.reduce(
        (acc, file) => acc + parseInt(file.size),
        0
      );
      const totalSizeInMb = totalSize / 1024 / 1024;
      const typeStats = files.reduce((acc, file) => {
        acc[file.type] = acc[file.type] ? acc[file.type] + 1 : 1;
        return acc;
      }, {});

      const recentFiles = files
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

      return new Response(
        JSON.stringify({ totalFiles, totalSizeInMb, typeStats, recentFiles }),
        { status: 200 }
      );
    }

    const query = {
      ...(type && type !== "All" && { type }),
      ...(path && { url: { $regex: `^${path}/[^/]+$` } }),
    };

    const files = await File.find(query);
    return new Response(JSON.stringify(files), { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch files",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

// Helper function to get all files recursively for stats
async function getAllDemoFiles(directoryPath) {
  let allFiles = [];

  async function scanDirectory(dirPath) {
    const fullPath = path.join(process.cwd(), "public", "DriveDemo", dirPath);

    try {
      const items = await fsPromises.readdir(fullPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory()) {
          // Recursion for subdirectories
          await scanDirectory(path.join(dirPath, item.name));
        } else {
          // It's a file, add it to the list
          const fileStat = await fsPromises.stat(
            path.join(fullPath, item.name)
          );
          const fileSizeInKB = Math.round(fileStat.size / 1024);

          allFiles.push({
            name: item.name,
            type: getFileType(item.name),
            size: fileSizeInKB,
            sizeFormatted: `${fileSizeInKB} KB`,
            location: "Demo",
            date: fileStat.mtime.toISOString(),
            url: `${dirPath}/${item.name}`,
            metadata: {
              name: item.name,
              mimeType: getMimeType(item.name),
              extension: path.extname(item.name),
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  await scanDirectory(directoryPath);
  return allFiles;
}

export async function DELETE(request) {
  try {
    // Check if in demo mode - prevent deletions
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({ message: "File deletions not allowed in demo mode" }),
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { urls } = await request.json();

    if (!urls || urls.length === 0) {
      return new Response(
        JSON.stringify({ message: "No files specified for deletion" }),
        {
          status: 400,
        }
      );
    }

    const deletedFiles = [];

    for (const url of urls) {
      const file = await File.findOne({ url });

      if (!file) {
        continue;
      }

      const filePath = path.join(process.cwd(), "uploads", file.url);
      await fs.unlink(filePath);
      await file.deleteOne();
      deletedFiles.push(file);
    }

    if (deletedFiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No files found for deletion" }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Files deleted successfully",
        files: deletedFiles,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting files:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to delete files",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
