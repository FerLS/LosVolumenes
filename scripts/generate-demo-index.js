const fs = require("fs");
const path = require("path");

const DEMO_DIR = path.join(process.cwd(), "public", "DriveDemo");
const OUTPUT_FILE = path.join(DEMO_DIR, "index.json");

function getFileType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext))
    return "Image";
  if ([".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext))
    return "Video";
  if ([".mp3", ".wav", ".ogg", ".flac", ".aac"].includes(ext)) return "Audio";
  return "Other";
}

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
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Función recursiva para escanear directorios
function scanDirectory(dir, basePath = "") {
  const result = {
    files: [],
    folders: {},
  };

  const relativePath = path.join(basePath, path.basename(dir));
  const folderPath = relativePath || "drive";
  result.folders[folderPath] = [];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    const itemRelativePath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      // Es un directorio, añadir a la lista de carpetas
      result.folders[folderPath].push(item.name);

      // Escanear recursivamente
      const subResult = scanDirectory(itemPath, folderPath);

      // Fusionar resultados
      result.files = [...result.files, ...subResult.files];
      result.folders = { ...result.folders, ...subResult.folders };
    } else if (item.name !== "index.json") {
      // Es un archivo (ignorar index.json)
      const stat = fs.statSync(itemPath);
      const fileSizeInKB = Math.round(stat.size / 1024);

      result.files.push({
        name: item.name,
        type: getFileType(item.name),
        size: fileSizeInKB,
        sizeFormatted: `${fileSizeInKB} KB`,
        location: "Demo",
        date: stat.mtime.toISOString(),
        url: itemRelativePath.replace(/\\/g, "/"), // Asegurar formato de URL con /
        metadata: {
          name: item.name,
          mimeType: getMimeType(item.name),
          extension: path.extname(item.name),
        },
        favorite: Math.random() > 0.8, // Aleatoriamente marcar algunos como favoritos
      });
    }
  }

  return result;
}

// Ejecutar el escaneo
try {
  console.log(`Escaneando directorio: ${DEMO_DIR}`);
  const data = scanDirectory(DEMO_DIR);

  // Reorganizar para formato esperado
  const result = {
    files: data.files,
    folders: data.folders,
  };

  // Guardar el archivo JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Archivo index.json generado con éxito: ${OUTPUT_FILE}`);
  console.log(`Total archivos: ${result.files.length}`);
  console.log(`Total carpetas: ${Object.keys(result.folders).length}`);
} catch (error) {
  console.error("Error generando index.json:", error);
}
