import fs from "fs/promises";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import File from "@/models/file";

// GitHub API handling
// GitHub API handling
async function fetchFromGitHub(filePath) {
  const GITHUB_REPO = process.env.GITHUB_REPO || "owner/repo";
  const GITHUB_BRANCH = "main"; // Always use main branch as specified

  // Convert local path to GitHub path format
  const githubPath = filePath.replace(/^.*?uploads\//, "");

  // Simplified headers for public repo
  const headers = {
    Accept: "application/vnd.github.v3.raw",
  };

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${githubPath}?ref=${GITHUB_BRANCH}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}
export async function GET(request) {
  try {
    const isDemo = process.env.DEMO === "true";
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");

    if (!fileUrl) {
      return new Response(JSON.stringify({ message: "No url specified" }), {
        status: 400,
      });
    }

    const filePath = path.join(process.cwd(), "uploads", fileUrl);
    let file;
    let fileName = path.basename(filePath);

    if (isDemo) {
      try {
        file = await fetchFromGitHub(filePath);
      } catch (error) {
        console.error("GitHub fetch error:", error);
        return new Response(
          JSON.stringify({ message: "File not found in GitHub repository" }),
          {
            status: 404,
          }
        );
      }
    } else {
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
    if (process.env.DEMO === "true") {
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
