import axios from "axios";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }
    console.log(process.cwd());

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }

    // accessing user's data
    const filepath = path.join(uploadDir, "userdata.json");
    if (existsSync(filepath)) {
      const userData = await fs.readFile(filepath, "utf-8");
      const data = JSON.parse(userData);

      const previousFileName = data.resumeFileName;
      const previousFilePath = path.join(uploadDir, previousFileName);

      if (previousFileName && existsSync(previousFilePath)) {
        unlinkSync(previousFilePath);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, uint8Array);

    return NextResponse.json({
      message: "Resume uploaded successfully",
      filePath: filePath,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Error uploading resume" },
      { status: 500 }
    );
  }
}
