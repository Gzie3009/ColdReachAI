import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const filepath = path.join(process.cwd(), "uploads", filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      message: "Resume uploaded successfully",
      filepath 
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { error: "Error uploading resume" },
      { status: 500 }
    );
  }
}