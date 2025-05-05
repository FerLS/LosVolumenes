import connectToDatabase from "@/lib/mongodb";
import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import { promises as fsPromises } from "fs";
import demoData from "@/public/DriveDemo/index.json";

import File from "@/models/file";
// Helper function to handle different path formats
async function listFoldersFromDemo(directoryPath) {
  try {
    // Normalize the path to handle both slash types
    let relativePath = directoryPath.replace(/^uploads\//, "");

    console.log("Initial path:", relativePath);

    // Special case for root
    if (relativePath === "" || relativePath === "/") {
      console.log("Returning root folders");
      return demoData.folders["DriveDemo"] || [];
    }

    // Special case for /drive root
    if (relativePath === "drive" || relativePath === "/drive") {
      console.log("Returning drive folders");
      return demoData.folders["DriveDemo\\drive"] || [];
    }

    // Convert forward slashes to backslashes for JSON lookup
    relativePath = relativePath.replace(/\//g, "\\");

    // Add "DriveDemo\" prefix if not already present
    if (!relativePath.startsWith("DriveDemo\\")) {
      relativePath = "DriveDemo\\" + relativePath;
    }

    console.log("Looking for folders with key:", relativePath);

    // Simply look up the path directly in the folders object
    if (demoData.folders[relativePath]) {
      return demoData.folders[relativePath];
    }

    console.log("Path not found in folders structure");
    return [];
  } catch (error) {
    console.error("Error fetching demo folders:", error);
    return [];
  }
}

async function udpateFilesRecursive(dirPath, newPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      await udpateFilesRecursive(itemPath, newPath + "/" + item);
    } else {
      console.log("Updating file:", itemPath, "to", newPath + "/" + item);
      const file = await File.findOne({
        url: { $regex: `.*${item}.*` },
      });
      file.url = newPath + "/" + item;
      await file.save();
    }
  }
}

export async function GET(request) {
  try {
    const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
    const url = new URL(request.url);
    const folderPath = url.searchParams.get("path");

    if (!folderPath) {
      return new Response(JSON.stringify({ message: "No path specified" }), {
        status: 400,
      });
    }

    if (isDemo) {
      // En modo demo, obtener carpetas de la estructura demo
      const serverFolderPath = `uploads/${folderPath}`;
      const folders = await listFoldersFromDemo(serverFolderPath);

      return new Response(JSON.stringify(folders), { status: 200 });
    } else {
      // Regular mode - use file system
      const serverFolderPath = path.join(process.cwd(), "uploads", folderPath);
      const folders = fs
        .readdirSync(serverFolderPath)
        .filter((file) =>
          fs.statSync(path.join(serverFolderPath, file)).isDirectory()
        );
      return new Response(JSON.stringify(folders), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching folders:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch folders",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check if in demo mode - prevent folder creation
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({ message: "Folder creation not allowed in demo mode" }),
        { status: 403 }
      );
    }

    const { path: folderPath } = await request.json();

    if (!folderPath) {
      return new Response(
        JSON.stringify({ message: "Path or name not specified" }),
        {
          status: 400,
        }
      );
    }

    const serverFolderPath = path.join(process.cwd(), "uploads", folderPath);

    if (fs.existsSync(serverFolderPath)) {
      return new Response(
        JSON.stringify({ message: "Folder already exists" }),
        {
          status: 400,
        }
      );
    }

    fs.mkdirSync(serverFolderPath, { recursive: true });

    return new Response(
      JSON.stringify({ message: "Folder created successfully" }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creating folder:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to create folder",
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
        JSON.stringify({
          message: "Folder modifications not allowed in demo mode",
        }),
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { oldPaths, newPath } = await request.json();

    if (!oldPaths || oldPaths.length === 0) {
      return new Response(
        JSON.stringify({ message: "Updates array is required" }),
        {
          status: 400,
        }
      );
    }

    const updatedFolders = [];

    for (const oldPath of oldPaths) {
      if (!oldPath) {
        continue;
      }

      const oldFolderPath = path.join(process.cwd(), "uploads", oldPath);
      const newFolderPath = path.join(
        process.cwd(),
        "uploads",
        newPath + "/" + oldPath.split("/").pop()
      );

      console.log("Moving folder:", oldFolderPath, newFolderPath);

      if (!fs.existsSync(oldFolderPath)) {
        continue;
      }

      await udpateFilesRecursive(
        oldFolderPath,
        newPath + "/" + oldPath.split("/").pop()
      );

      await fsExtra.moveSync(oldFolderPath, newFolderPath, {
        overwrite: false,
      });

      updatedFolders.push({ oldPath, newPath });
    }

    if (updatedFolders.length === 0) {
      return new Response(JSON.stringify({ message: "No folders updated" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Folders updated successfully",
        folders: updatedFolders,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating folders:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to update folders",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Check if in demo mode - prevent deletions
    if (process.env.NEXT_PUBLIC_DEMO === "true") {
      return new Response(
        JSON.stringify({
          message: "Folder deletions not allowed in demo mode",
        }),
        { status: 403 }
      );
    }

    const { folders: folderPaths } = await request.json();

    if (!folderPaths) {
      return new Response(JSON.stringify({ message: "Path not specified" }), {
        status: 400,
      });
    }

    for (const folderPath of folderPaths) {
      console.log("Deleting folder:", folderPath);
      const serverFolderPath = path.join(process.cwd(), "uploads", folderPath);

      if (!fs.existsSync(serverFolderPath)) {
        return new Response(
          JSON.stringify({ message: "Folder does not exist" }),
          {
            status: 404,
          }
        );
      }

      fs.rmdirSync(serverFolderPath, { recursive: true });
      const files = await File.find({
        url: { $regex: `.*${folderPath}/[^/]+.*` },
      });
      files.forEach(async (file) => {
        await file.deleteOne();
      });
    }

    return new Response(
      JSON.stringify({ message: "Folders deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to delete folder",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
