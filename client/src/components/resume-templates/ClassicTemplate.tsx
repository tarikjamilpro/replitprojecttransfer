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

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
  ].filter(Boolean);

  return (
    <div 
      className="relative p-10 bg-white text-black min-h-full flex flex-col" 
      style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
    >
      {photo && (
        <div className="absolute top-8 right-8">
          <img
            src={photo}
            alt="Profile"
            className="w-24 h-24 object-cover border border-gray-300"
          />
        </div>
      )}

      <header className="text-center mb-8 pr-28">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">
          {personal.name || "Your Name"}
        </h1>
        {personal.title && (
          <p className="text-lg text-gray-600 mt-1 italic">{personal.title}</p>
        )}
        {contactItems.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {contactItems.join(" • ")}
          </p>
        )}
      </header>

      {personal.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest pb-2 border-b-2 border-gray-300 mb-3">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{personal.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest pb-2 border-b-2 border-gray-300 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
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
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest pb-2 border-b-2 border-gray-300 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree || "Degree"}</h3>
                  <p className="text-sm text-gray-600 italic">{edu.school || "School"}</p>
                </div>
                <span className="text-sm text-gray-500 italic">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest pb-2 border-b-2 border-gray-300 mb-3">
            Skills
          </h2>
          <p className="text-sm text-gray-700">{skills.join(" • ")}</p>
        </section>
      )}

      <div className="flex-grow" />

      {signature && (
        <div className="mt-8 pt-4 flex flex-col items-end">
          <img src={signature} alt="Signature" className="max-h-[60px] object-contain mb-1" />
          <div className="w-48 border-t border-gray-400 pt-1">
            <p className="text-xs text-gray-500 text-center italic">Authorized Signature</p>
          </div>
        </div>
      )}
    </div>
  );
}
