"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Upload, Loader2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

const emailTemplates = {
  standard: "standard",
  creative: "creative",
  technical: "technical",
  executive: "executive",
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [jobPost, setJobPost] = useState("");
  const [autoSend, setAutoSend] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [template, setTemplate] = useState(emailTemplates.standard);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setResume(file);
        toast.success("Resume uploaded", {
          description: "Your resume has been successfully uploaded.",
        });
      } else {
        toast.error("Invalid file type", {
          description: "Please upload a PDF file.",
        });
      }
    }
  };

  const handleGenerateEmail = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      if (resume) {
        formData.append("resume", resume);
      }
      formData.append("jobPost", jobPost);
      formData.append("template", template);

      const response = await fetch("/api/generateEmail", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedEmail(data.email);
        toast.success("Email generated", {
          description: "Your personalized email has been generated.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to generate email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          appPassword,
          generatedEmail,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Success", {
          description: "Your email has been sent successfully.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send email. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = () => {
    if (email && appPassword && resume) {
      setIsConfigured(true);
      setIsEditing(false);
      toast.success("Configuration saved", {
        description: "Your email settings have been saved.",
      });
    } else {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Cold Email Automation</h1>
          <p className="text-muted-foreground">
            Generate and send personalized job application emails
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Configuration</h2>
              {isConfigured && !isEditing && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {isConfigured && isEditing && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={handleSaveConfiguration}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">{email}</p>
                ) : (
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="appPassword">App Password</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">••••••••</p>
                ) : (
                  <Input
                    id="appPassword"
                    type="password"
                    placeholder="Your app password"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF)</Label>
                {isConfigured && !isEditing ? (
                  <p className="text-sm text-muted-foreground">
                    {resume?.name || "No resume uploaded"}
                  </p>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("resume")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {resume ? resume.name : "Upload Resume"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={emailTemplates.standard}>Standard</SelectItem>
                    <SelectItem value={emailTemplates.creative}>Creative</SelectItem>
                    <SelectItem value={emailTemplates.technical}>Technical</SelectItem>
                    <SelectItem value={emailTemplates.executive}>Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isConfigured && (
                <Button 
                  onClick={handleSaveConfiguration}
                  className="w-full"
                >
                  Save Configuration
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Job Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobPost">Job Post Content</Label>
                <Textarea
                  id="jobPost"
                  placeholder="Paste the job post content here..."
                  value={jobPost}
                  onChange={(e) => setJobPost(e.target.value)}
                  className="h-[150px]"
                />
              </div>

              <Button 
                onClick={handleGenerateEmail} 
                className="w-full"
                disabled={isLoading || !isConfigured}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Generate Email
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Generated Email</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="autoSend">Auto-send</Label>
              <Switch
                id="autoSend"
                checked={autoSend}
                onCheckedChange={setAutoSend}
              />
            </div>
          </div>

          <Textarea
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="h-[300px]"
            placeholder="Generated email will appear here..."
          />

          <Button 
            onClick={handleSendEmail} 
            className="w-full" 
            size="lg"
            disabled={isLoading || !isConfigured}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>
        </Card>
      </div>
    </div>
  );
}