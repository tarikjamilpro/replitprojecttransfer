import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Trash2, ChevronDown, FileText, Sparkles, User, GraduationCap, Briefcase, Wrench } from "lucide-react";

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
};

const emptyData: ResumeData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", summary: "" },
  education: [],
  experience: [],
  skills: [],
};

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(emptyData);
  const [openSections, setOpenSections] = useState({
    personal: true,
    education: true,
    experience: true,
    skills: true,
  });
  const [newSkill, setNewSkill] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const updatePersonal = (field: keyof ResumeData["personal"], value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
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
    setResumeData(demoData);
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

  const { personal, education, experience, skills } = resumeData;

  return (
    <div className="min-h-screen bg-background">
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

            <Button
              onClick={handleDownloadPDF}
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
                  Live Preview
                </div>
                <div className="p-4 bg-muted/20 flex justify-center overflow-auto" style={{ maxHeight: "calc(100vh - 150px)" }}>
                  <div
                    id="resume-preview"
                    className="bg-white text-black shadow-lg"
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      padding: "15mm",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {personal.name ? (
                      <>
                        <header className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">{personal.name}</h1>
                          {personal.title && <p className="text-lg text-gray-600 mb-2">{personal.title}</p>}
                          <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1">
                            {personal.email && <span>{personal.email}</span>}
                            {personal.phone && <span>{personal.phone}</span>}
                            {personal.location && <span>{personal.location}</span>}
                          </div>
                        </header>

                        {personal.summary && (
                          <section className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">Summary</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">{personal.summary}</p>
                          </section>
                        )}

                        {experience.length > 0 && (
                          <section className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">Experience</h2>
                            {experience.map((exp) => (
                              <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{exp.role || "Role"}</h3>
                                    <p className="text-sm text-gray-600">{exp.company || "Company"}</p>
                                  </div>
                                  <span className="text-sm text-gray-500">{exp.year}</span>
                                </div>
                                {exp.description && (
                                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </section>
                        )}

                        {education.length > 0 && (
                          <section className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">Education</h2>
                            {education.map((edu) => (
                              <div key={edu.id} className="mb-2 flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{edu.degree || "Degree"}</h3>
                                  <p className="text-sm text-gray-600">{edu.school || "School"}</p>
                                </div>
                                <span className="text-sm text-gray-500">{edu.year}</span>
                              </div>
                            ))}
                          </section>
                        )}

                        {skills.length > 0 && (
                          <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}
                      </>
                    ) : (
                      <div className="h-full min-h-[400px] flex items-center justify-center text-gray-400">
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
      </div>
    </div>
  );
}
