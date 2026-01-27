import { Mail, Phone, MapPin } from "lucide-react";

interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{ id: string; school: string; degree: string; year: string }>;
  experience: Array<{ id: string; company: string; role: string; year: string; description: string }>;
  skills: string[];
  photo: string | null;
  signature: string | null;
}

interface TemplateProps {
  resumeData: ResumeData;
}

export default function ModernTemplate({ resumeData }: TemplateProps) {
  const { personal, education, experience, skills, photo, signature } = resumeData;

  return (
    <div className="grid grid-cols-12 min-h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="col-span-4 bg-slate-800 text-white p-6">
        {photo && (
          <div className="mb-8 flex justify-center">
            <img
              src={photo}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
            />
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-600">
            Contact
          </h2>
          <div className="space-y-3">
            {personal.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm break-all">{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm">{personal.phone}</span>
              </div>
            )}
            {personal.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm">{personal.location}</span>
              </div>
            )}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-600">
              Skills
            </h2>
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{skill}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${75 + (index % 3) * 8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="col-span-8 bg-white text-black p-8 flex flex-col">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">
            {personal.name || "Your Name"}
          </h1>
          {personal.title && (
            <p className="text-xl text-blue-600 font-medium mt-1">{personal.title}</p>
          )}
        </header>

        {personal.summary && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 pb-2 border-b-2 border-blue-600">
              Profile
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 pb-2 border-b-2 border-blue-600">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800">{exp.role || "Role"}</h3>
                      <p className="text-sm text-blue-600 font-medium">{exp.company || "Company"}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                      {exp.year}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 pb-2 border-b-2 border-blue-600">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-800">{edu.degree || "Degree"}</h3>
                      <p className="text-sm text-slate-600">{edu.school || "School"}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex-grow" />

        {signature && (
          <div className="mt-auto pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Signature</p>
            <img src={signature} alt="Signature" className="max-h-[60px] object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
