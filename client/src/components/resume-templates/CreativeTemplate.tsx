import { Mail, Phone, MapPin, Globe } from "lucide-react";

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

export default function CreativeTemplate({ resumeData }: TemplateProps) {
  const { personal, education, experience, skills, photo, signature } = resumeData;

  return (
    <div className="bg-white text-black min-h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-emerald-600 text-white pt-8 pb-16 px-8 text-center relative">
        <h1 className="text-3xl font-bold tracking-wide">
          {personal.name || "Your Name"}
        </h1>
        {personal.title && (
          <p className="text-lg text-emerald-100 mt-1 font-medium">{personal.title}</p>
        )}
      </header>

      <div className="relative flex justify-center" style={{ marginTop: "-48px" }}>
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-emerald-200 border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-emerald-600 text-2xl font-bold">
              {personal.name ? personal.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>

      {personal.summary && (
        <div className="px-8 pt-6 pb-4 text-center">
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">{personal.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 p-8 pt-4">
        <div className="space-y-6">
          {experience.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-emerald-600"></span>
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-emerald-200 pl-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{exp.role || "Role"}</h3>
                      <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                        {exp.year}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600 font-medium">{exp.company || "Company"}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-emerald-600"></span>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-emerald-200 pl-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree || "Degree"}</h3>
                    <p className="text-sm text-gray-600">{edu.school || "School"}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {signature && (
            <div className="pt-6">
              <p className="text-sm text-gray-500 italic mb-2">Sincerely,</p>
              <img src={signature} alt="Signature" className="max-h-[60px] object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-emerald-600"></span>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-600"></span>
              Contact
            </h2>
            <div className="space-y-3">
              {personal.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm text-gray-700 break-all">{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-700">{personal.phone}</span>
                </div>
              )}
              {personal.location && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm text-gray-700">{personal.location}</span>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-600"></span>
              Languages
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">English</span>
                <span className="text-xs text-emerald-600 font-medium">Native</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Spanish</span>
                <span className="text-xs text-emerald-600 font-medium">Professional</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
