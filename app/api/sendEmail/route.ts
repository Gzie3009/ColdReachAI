import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createCipheriv, randomBytes, scryptSync } from "crypto";

// In a real app, these would be environment variables
const ENCRYPTION_KEY = scryptSync('your-password', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, appPassword, generatedEmail } = await request.json();

    // Encrypt sensitive data
    const encryptedPassword = encrypt(appPassword);

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: appPassword, // Use app password for Gmail
      },
    });

    // Send email
    await transporter.sendMail({
      from: email,
      to: "recipient@example.com", // This would be dynamically set
      subject: "Job Application",
      text: generatedEmail,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Error sending email" },
      { status: 500 }
    );
  }
}