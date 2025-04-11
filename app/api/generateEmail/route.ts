import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function parseResume(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing resume:", error);
    return "";
  }
}

async function generateEmailWithAI(resumeText: string, jobPost: string): Promise<string> {
  try {
    const prompt = `
      Create a professional job application email using the following information:
      
      Resume: ${resumeText}
      
      Job Post: ${jobPost}
      
      Write a personalized cover letter that highlights relevant experience from the resume and addresses key requirements from the job post.
      Keep the tone professional but engaging. Include a clear call to action at the end.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating email with AI:", error);
    return generateFallbackEmail(jobPost);
  }
}

function generateFallbackEmail(jobPost: string): string {
  return `Dear Hiring Manager,

I am writing to express my interest in the position described in your job posting. Based on the requirements and responsibilities outlined, I believe my skills and experience make me an excellent candidate for this role.

${jobPost ? `I was particularly drawn to the following aspects of the position:\n${jobPost.split('\n').slice(0, 3).join('\n')}` : ''}

I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my background aligns with your needs.

Thank you for considering my application.

Best regards,
[Your name]`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobPost = formData.get("jobPost") as string;
    const resumeFile = formData.get("resume") as File;

    let generatedEmail = "";

    if (resumeFile) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const resumeText = await parseResume(buffer);
      generatedEmail = await generateEmailWithAI(resumeText, jobPost);
    } else {
      generatedEmail = generateFallbackEmail(jobPost);
    }

    return NextResponse.json({ email: generatedEmail });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json(
      { error: "Error generating email" },
      { status: 500 }
    );
  }
}