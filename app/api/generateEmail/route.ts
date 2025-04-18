import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { jobPost, instructions, recieverMail, template } =
      await request.json();

    const prompt = `
You are a helpful assistant that writes professional, personalized job application emails. 
Based on the job post and the following instructions, generate an email using this template format:

Template:
${template}

Instructions: ${instructions || "N/A"}

Job Post:
${jobPost}

Receiver Email: ${recieverMail || "Not specified"}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedEmail = response.text();

    return NextResponse.json({ email: generatedEmail.trim() });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json(
      { error: "Error generating email" },
      { status: 500 }
    );
  }
}
