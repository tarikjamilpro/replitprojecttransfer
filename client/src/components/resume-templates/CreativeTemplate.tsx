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
    <div className="bg-white text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-6">
          {photo && (
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{personal.name || "Your Name"}</h1>
            {personal.title && <p className="text-xl text-purple-200 mt-1">{personal.title}</p>}
            <div className="text-sm text-purple-100 flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div>
          {personal.summary && (
            <section className="mb-5">
              <h2 className="text-lg font-bold text-purple-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-1 bg-purple-600 rounded"></span>
                About Me
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{personal.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold text-purple-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-1 bg-purple-600 rounded"></span>
                Experience
              </h2>
              {experience.map((exp) => (
                <div key={exp.id} className="mb-4 pl-4 border-l-2 border-purple-200">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{exp.role || "Role"}</h3>
                    <span className="text-xs text-white bg-purple-500 px-2 py-0.5 rounded-full">{exp.year}</span>
                  </div>
                  <p className="text-sm text-purple-600 font-medium">{exp.company || "Company"}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        <div>
          {education.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold text-purple-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-1 bg-purple-600 rounded"></span>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-3 p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{edu.degree || "Degree"}</h3>
                  <p className="text-sm text-gray-600">{edu.school || "School"}</p>
                  <p className="text-xs text-purple-600 mt-1">{edu.year}</p>
                </div>
              ))}
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-5">
              <h2 className="text-lg font-bold text-purple-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-1 bg-purple-600 rounded"></span>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {signature && (
            <div className="mt-6 pt-4 border-t border-purple-200">
              <p className="text-xs text-gray-500 mb-1">Signature</p>
              <img src={signature} alt="Signature" className="max-h-[60px] object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
