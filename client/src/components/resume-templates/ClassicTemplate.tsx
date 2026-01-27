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

export default function ClassicTemplate({ resumeData }: TemplateProps) {
  const { personal, education, experience, skills, photo, signature } = resumeData;

  return (
    <div className="p-8 bg-white text-black" style={{ fontFamily: "'Georgia', serif" }}>
      <header className="text-center mb-6 pb-4 border-b-2 border-gray-800">
        {photo && (
          <div className="mb-4 flex justify-center">
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          {personal.name || "Your Name"}
        </h1>
        {personal.title && <p className="text-lg text-gray-600 mt-1 italic">{personal.title}</p>}
        <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
        </div>
      </header>

      {personal.summary && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-300 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{personal.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-300 uppercase tracking-wide">
            Professional Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{exp.role || "Role"}</h3>
                <span className="text-sm text-gray-500 italic">{exp.year}</span>
              </div>
              <p className="text-sm text-gray-700 italic">{exp.company || "Company"}</p>
              {exp.description && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed text-justify">{exp.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-300 uppercase tracking-wide">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2 flex justify-between items-baseline">
              <div>
                <h3 className="font-bold text-gray-900">{edu.degree || "Degree"}</h3>
                <p className="text-sm text-gray-600 italic">{edu.school || "School"}</p>
              </div>
              <span className="text-sm text-gray-500 italic">{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-300 uppercase tracking-wide">
            Skills
          </h2>
          <p className="text-sm text-gray-700">{skills.join(" • ")}</p>
        </section>
      )}

      {signature && (
        <div className="mt-6 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-500 mb-2 italic">Signature</p>
          <img src={signature} alt="Signature" className="max-h-[60px] object-contain mx-auto" />
        </div>
      )}
    </div>
  );
}
