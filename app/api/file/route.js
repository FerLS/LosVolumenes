import fs from "fs/promises";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/file";

// Función para obtener archivos demo
async function fetchDemoFile(fileUrl) {
  try {
    // Crear ruta de acceso al archivo en public/DriveDemo
    const demoFilePath = path.join(
      process.cwd(),
      "public",
      "DriveDemo",
      fileUrl
    );

    console.log("Accediendo al archivo demo:", demoFilePath);

    // Verificar si el archivo existe
    await fs.access(demoFilePath);

    // Leer el archivo
    const fileBuffer = await fs.readFile(demoFilePath);
    return fileBuffer;
  } catch (error) {
    console.error("Demo file error:", error);
    throw new Error(`Demo file not found: ${fileUrl}`);
  }
}

export async function GET(request) {
  try {
    const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");

    if (!fileUrl) {
      return new Response(JSON.stringify({ message: "No url specified" }), {
        status: 400,
      });
    }

    let file;
    let fileName = path.basename(fileUrl);

    if (isDemo) {
      try {
        // En modo demo, enviamos la URL directamente al navegador para archivos estáticos
        // o leemos el archivo para mayor control
        file = await fetchDemoFile(fileUrl);
      } catch (error) {
        console.error("Demo file fetch error:", error);
        return new Response(
          JSON.stringify({ message: "File not found in demo directory" }),
          {
            status: 404,
          }
        );
      }
    } else {
      const filePath = path.join(process.cwd(), "uploads", fileUrl);
      try {
        await fs.access(filePath);
      } catch {
        return new Response(JSON.stringify({ message: "File not found" }), {
          status: 404,
        });
      }
      file = await fs.readFile(filePath);
    }

    const headers = new Headers();
    headers.append("Content-Disposition", `attachment; filename="${fileName}"`);

    return new Response(file, { status: 200, headers });
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

export async function PUT(request) {
  try {
    // Check if in demo mode - prevent modifications
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({ message: "Modifications not allowed in demo mode" }),
        {
          status: 403,
        }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const fileUrl = body.url;
    const favorite = body.favorite === true;

    if (!fileUrl) {
      return new Response(JSON.stringify({ message: "No url specified" }), {
        status: 400,
      });
    }

    const file = await File.findOne({ url: fileUrl });

    if (!file) {
      return new Response(JSON.stringify({ message: "File not found" }), {
        status: 404,
      });
    }

    file.favorite = favorite;
    await file.save();

    return new Response(
      JSON.stringify({
        message: "File updated successfully",
        file: file,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating file:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to update file",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
