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
    <div className="flex h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-1/3 bg-blue-800 text-white p-6">
        {photo && (
          <div className="mb-6 flex justify-center">
            <img
              src={photo}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white"
            />
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-blue-600 pb-1">Contact</h2>
          {personal.email && <p className="text-sm mb-1 break-words">{personal.email}</p>}
          {personal.phone && <p className="text-sm mb-1">{personal.phone}</p>}
          {personal.location && <p className="text-sm">{personal.location}</p>}
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-blue-600 pb-1">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <span key={index} className="text-xs bg-blue-700 px-2 py-1 rounded mb-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3 p-6 bg-white text-black">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-800">{personal.name || "Your Name"}</h1>
          {personal.title && <p className="text-lg text-gray-600 mt-1">{personal.title}</p>}
        </header>

        {personal.summary && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 mb-2 border-b-2 border-blue-800 pb-1">
              Profile
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 mb-2 border-b-2 border-blue-800 pb-1">
              Experience
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.role || "Role"}</h3>
                    <p className="text-sm text-blue-700">{exp.company || "Company"}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.year}</span>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 mb-2 border-b-2 border-blue-800 pb-1">
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree || "Degree"}</h3>
                  <p className="text-sm text-gray-600">{edu.school || "School"}</p>
                </div>
                <span className="text-xs text-gray-500">{edu.year}</span>
              </div>
            ))}
          </section>
        )}

        {signature && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Signature</p>
            <img src={signature} alt="Signature" className="max-h-[60px] object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
