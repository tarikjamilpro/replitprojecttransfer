import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Trash2, ChevronDown, FileText, Sparkles, User, GraduationCap, Briefcase, Wrench, ImageIcon, PenTool, Palette, Check } from "lucide-react";
import ModernTemplate from "@/components/resume-templates/ModernTemplate";
import ClassicTemplate from "@/components/resume-templates/ClassicTemplate";
import CreativeTemplate from "@/components/resume-templates/CreativeTemplate";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  year: string;
  description: string;
}

interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  photo: string | null;
  signature: string | null;
  activeTemplate: "modern" | "classic" | "creative";
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const demoData: ResumeData = {
  personal: {
    name: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    summary: "Passionate software engineer with 8+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Led teams of 5-10 engineers and delivered projects that increased company revenue by 40%.",
  },
  education: [
    { id: "edu1", school: "Stanford University", degree: "M.S. Computer Science", year: "2014 - 2016" },
    { id: "edu2", school: "UC Berkeley", degree: "B.S. Computer Science", year: "2010 - 2014" },
  ],
  experience: [
    {
      id: "exp1",
      company: "Tech Corp Inc.",
      role: "Senior Software Engineer",
      year: "2020 - Present",
      description: "Lead development of microservices architecture serving 10M+ users. Mentored junior developers and established coding standards.",
    },
    {
      id: "exp2",
      company: "StartupXYZ",
      role: "Full Stack Developer",
      year: "2016 - 2020",
      description: "Built core product features using React and Node.js. Implemented CI/CD pipelines reducing deployment time by 60%.",
    },
  ],
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
  photo: null,
  signature: null,
  activeTemplate: "modern",
};

const emptyData: ResumeData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", summary: "" },
  education: [],
  experience: [],
  skills: [],
  photo: null,
  signature: null,
  activeTemplate: "modern",
};

const TemplateThumbnail = ({ type }: { type: "modern" | "classic" | "creative" }) => {
  if (type === "modern") {
    return (
      <div className="h-20 rounded border border-gray-200 overflow-hidden flex">
        <div className="w-1/3 bg-slate-800 p-1">
          <div className="w-3 h-3 rounded-full bg-slate-600 mx-auto mb-1" />
          <div className="space-y-0.5">
            <div className="h-0.5 bg-slate-600 rounded" />
            <div className="h-0.5 bg-slate-600 rounded w-3/4" />
          </div>
        </div>
        <div className="w-2/3 bg-white p-1.5">
          <div className="h-1.5 bg-slate-300 rounded w-3/4 mb-1" />
          <div className="h-0.5 bg-slate-200 rounded mb-0.5" />
          <div className="h-0.5 bg-slate-200 rounded w-5/6 mb-1" />
          <div className="h-0.5 bg-blue-400 rounded w-1/2 mb-0.5" />
          <div className="h-0.5 bg-slate-200 rounded" />
          <div className="h-0.5 bg-slate-200 rounded w-4/5 mt-0.5" />
        </div>
      </div>
    );
  }
  
  if (type === "classic") {
    return (
      <div className="h-20 rounded border border-gray-200 overflow-hidden bg-white p-2">
        <div className="text-center mb-1">
          <div className="h-1.5 bg-slate-400 rounded w-1/2 mx-auto mb-0.5" />
          <div className="h-0.5 bg-slate-300 rounded w-1/3 mx-auto" />
        </div>
        <div className="h-px bg-gray-300 my-1" />
        <div className="space-y-0.5">
          <div className="h-0.5 bg-slate-200 rounded" />
          <div className="h-0.5 bg-slate-200 rounded w-5/6" />
          <div className="h-0.5 bg-slate-200 rounded w-4/5" />
        </div>
        <div className="h-px bg-gray-300 my-1" />
        <div className="space-y-0.5">
          <div className="h-0.5 bg-slate-200 rounded w-3/4" />
          <div className="h-0.5 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-20 rounded border border-gray-200 overflow-hidden bg-white">
      <div className="h-5 bg-emerald-500 flex items-center justify-center">
        <div className="h-1 bg-white/60 rounded w-1/3" />
      </div>
      <div className="w-4 h-4 rounded-full bg-emerald-200 border-2 border-white mx-auto -mt-2 relative z-10" />
      <div className="grid grid-cols-2 gap-1 p-1.5 pt-1">
        <div className="space-y-0.5">
          <div className="h-0.5 bg-slate-200 rounded" />
          <div className="h-0.5 bg-slate-200 rounded w-3/4" />
          <div className="h-0.5 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="space-y-0.5">
          <div className="flex gap-0.5">
            <div className="h-1.5 w-3 bg-gray-200 rounded-full" />
            <div className="h-1.5 w-3 bg-gray-200 rounded-full" />
          </div>
          <div className="h-0.5 bg-slate-200 rounded w-2/3" />
          <div className="h-0.5 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

const templates = [
  { id: "modern" as const, name: "Modern", description: "Dark sidebar layout" },
  { id: "classic" as const, name: "Classic", description: "Traditional centered" },
  { id: "creative" as const, name: "Creative", description: "Bold header design" },
];

export default function ResumeBuilder() {
  const toolSEO = getToolSEO("/resume-builder");
  const [resumeData, setResumeData] = useState<ResumeData>(emptyData);
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [openSections, setOpenSections] = useState({
    template: true,
    personal: true,
    education: true,
    experience: true,
    skills: true,
    signature: true,
  });
  const [newSkill, setNewSkill] = useState("");
  const [downloading, setDownloading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: "photo" | "signature") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setResumeData((prev) => ({ ...prev, [field]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const updatePersonal = (field: keyof ResumeData["personal"], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const setActiveTemplate = (template: ResumeData["activeTemplate"]) => {
    setResumeData((prev) => ({ ...prev, activeTemplate: template }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { id: generateId(), school: "", degree: "", year: "" }],
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: generateId(), company: "", role: "", year: "", description: "" }],
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const loadDemoData = () => {
    setResumeData({ ...demoData, activeTemplate: resumeData.activeTemplate });
    toast({ title: "Demo data loaded!", description: "You can now see how your resume will look" });
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;

    setDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 0,
        filename: "my-resume.pdf",
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
      toast({ title: "PDF Downloaded!", description: "Your resume has been saved" });
    } catch (error) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const { personal, education, experience, skills, photo, activeTemplate } = resumeData;

  const renderTemplate = () => {
    const templateData = {
      personal: resumeData.personal,
      education: resumeData.education,
      experience: resumeData.experience,
      skills: resumeData.skills,
      photo: resumeData.photo,
      signature: resumeData.signature,
    };

    switch (activeTemplate) {
      case "modern":
        return <ModernTemplate resumeData={templateData} />;
      case "classic":
        return <ClassicTemplate resumeData={templateData} />;
      case "creative":
        return <CreativeTemplate resumeData={templateData} />;
      default:
        return <ModernTemplate resumeData={templateData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Resume Builder</h1>
              </div>
              <Button variant="outline" onClick={loadDemoData} data-testid="button-load-demo">
                <Sparkles className="w-4 h-4 mr-2" />
                Load Demo Data
              </Button>
            </div>

            <Card>
              <Collapsible open={openSections.template} onOpenChange={() => toggleSection("template")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Palette className="w-5 h-5 text-primary" />
                      Choose Template
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.template ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setActiveTemplate(template.id)}
                          className={`relative p-2 rounded-lg border-2 transition-all ${
                            activeTemplate === template.id
                              ? "border-blue-500 ring-2 ring-blue-500"
                              : "border-border hover:border-blue-300"
                          }`}
                          data-testid={`button-template-${template.id}`}
                        >
                          <TemplateThumbnail type={template.id} />
                          <p className="text-sm font-medium mt-2">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                          {activeTemplate === template.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <Collapsible open={openSections.personal} onOpenChange={() => toggleSection("personal")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.personal ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Photo</Label>
                      <div className="flex items-center gap-4">
                        {photo ? (
                          <img src={photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => photoInputRef.current?.click()}
                            data-testid="button-upload-photo"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            {photo ? "Change" : "Upload"}
                          </Button>
                          {photo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setResumeData((prev) => ({ ...prev, photo: null }))}
                              data-testid="button-remove-photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, "photo")}
                          data-testid="input-photo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={personal.name}
                          onChange={(e) => updatePersonal("name", e.target.value)}
                          placeholder="John Doe"
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={personal.title}
                          onChange={(e) => updatePersonal("title", e.target.value)}
                          placeholder="Software Engineer"
                          data-testid="input-title"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personal.email}
                          onChange={(e) => updatePersonal("email", e.target.value)}
                          placeholder="john@example.com"
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={personal.phone}
                          onChange={(e) => updatePersonal("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={personal.location}
                        onChange={(e) => updatePersonal("location", e.target.value)}
                        placeholder="New York, NY"
                        data-testid="input-location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={personal.summary}
                        onChange={(e) => updatePersonal("summary", e.target.value)}
                        placeholder="A brief summary of your professional background..."
                        rows={4}
                        data-testid="input-summary"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <Collapsible open={openSections.education} onOpenChange={() => toggleSection("education")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Education
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.education ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-4">
                    {education.map((edu, index) => (
                      <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Education #{index + 1}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeEducation(edu.id)}
                            data-testid={`button-remove-edu-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>School</Label>
                            <Input
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                              placeholder="University Name"
                              data-testid={`input-school-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="B.S. Computer Science"
                              data-testid={`input-degree-${index}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                            placeholder="2018 - 2022"
                            data-testid={`input-edu-year-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addEducation} className="w-full" data-testid="button-add-education">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <Collapsible open={openSections.experience} onOpenChange={() => toggleSection("experience")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Experience
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.experience ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-4">
                    {experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Experience #{index + 1}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeExperience(exp.id)}
                            data-testid={`button-remove-exp-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                              placeholder="Company Name"
                              data-testid={`input-company-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                              value={exp.role}
                              onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                              placeholder="Software Engineer"
                              data-testid={`input-role-${index}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            value={exp.year}
                            onChange={(e) => updateExperience(exp.id, "year", e.target.value)}
                            placeholder="2020 - Present"
                            data-testid={`input-exp-year-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                            data-testid={`input-description-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addExperience} className="w-full" data-testid="button-add-experience">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <Collapsible open={openSections.skills} onOpenChange={() => toggleSection("skills")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Wrench className="w-5 h-5 text-primary" />
                      Skills
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.skills ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., JavaScript)"
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        data-testid="input-new-skill"
                      />
                      <Button onClick={addSkill} data-testid="button-add-skill">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-1 hover:text-destructive"
                            data-testid={`button-remove-skill-${index}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <Collapsible open={openSections.signature} onOpenChange={() => toggleSection("signature")}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover-elevate flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <PenTool className="w-5 h-5 text-primary" />
                      Digital Signature
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openSections.signature ? "rotate-180" : ""}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground">Upload an image of your signature to add it to your resume.</p>
                    <div className="flex items-center gap-4">
                      {resumeData.signature ? (
                        <div className="p-2 border rounded-lg bg-white">
                          <img src={resumeData.signature} alt="Signature" className="max-h-[60px] object-contain" />
                        </div>
                      ) : (
                        <div className="w-32 h-16 border-2 border-dashed rounded-lg flex items-center justify-center">
                          <PenTool className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => signatureInputRef.current?.click()}
                          data-testid="button-upload-signature"
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          {resumeData.signature ? "Change" : "Upload"}
                        </Button>
                        {resumeData.signature && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResumeData((prev) => ({ ...prev, signature: null }))}
                            data-testid="button-remove-signature"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <input
                        ref={signatureInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "signature")}
                        data-testid="input-signature"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Button
              onClick={() => requestAction(handleDownloadPDF)}
              disabled={downloading || !personal.name}
              className="w-full"
              size="lg"
              data-testid="button-download-pdf"
            >
              {downloading ? (
                "Generating PDF..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>

          <div className="lg:w-1/2 lg:sticky lg:top-6" style={{ height: "fit-content" }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/50 p-2 text-center text-sm text-muted-foreground border-b">
                  Live Preview - {templates.find((t) => t.id === activeTemplate)?.name} Template
                </div>
                <div className="p-4 bg-muted/20 flex justify-center overflow-auto" style={{ maxHeight: "calc(100vh - 150px)" }}>
                  <div
                    id="resume-preview"
                    className="bg-white text-black shadow-lg overflow-hidden"
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                    }}
                  >
                    {personal.name ? (
                      renderTemplate()
                    ) : (
                      <div className="h-full min-h-[400px] flex items-center justify-center text-gray-400 p-8">
                        <div className="text-center">
                          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Start typing to see your resume</p>
                          <p className="text-sm mt-2">Or click "Load Demo Data" to see an example</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <RelatedTools currentToolId="resume-builder" category="Utility Tools" />
      </div>
      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="Resume Builder"
      />
    </div>
  );
}
