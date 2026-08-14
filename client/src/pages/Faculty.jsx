import { useEffect, useState } from "react";
import { Mail, GraduationCap } from "lucide-react";
import { getFaculty, resolveImageUrl } from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    getFaculty().then(setFaculty);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title="Faculty & Staff"
        description="Meet the experienced faculty and staff at Swastik College, Kathmandu — educators and industry professionals dedicated to student mentorship."
        path="/faculty"
        keywords="Swastik College faculty, Swastik College teachers, Swastik College staff"
      />
      <Section page="faculty" section="hero">
        <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-[#3B82F6] uppercase mb-2">
          Our People
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-3">
          Faculty & Staff
        </h1>
        <p className="text-navy-400 dark:text-navy-200 max-w-2xl mb-10">
          Meet the educators and administrators guiding students through their
          academic journey.
        </p>
      </Section>

      <Section page="faculty" section="grid">
        {faculty.length === 0 ? (
          <p className="text-navy-400 text-sm">
            Faculty information will appear here soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculty.map((f) => (
              <div
                key={f._id}
                className="border border-navy-100 dark:border-navy-700 rounded-xl p-6 bg-white dark:bg-navy-800"
              >
                <div className="w-14 h-14 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center overflow-hidden mb-4">
                  {f.photoUrl ? (
                    <img
                      src={resolveImageUrl(f.photoUrl)}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="text-navy-400" size={22} />
                  )}
                </div>
                <h3 className="font-display text-lg text-navy dark:text-paper">
                  {f.name}
                </h3>
                <p className="text-sm text-marigold-600 dark:text-marigold-300 font-medium">
                  {f.designation}
                </p>
                <p className="text-xs text-navy-400 dark:text-navy-300 mt-1">
                  {f.department} · {f.qualification}
                </p>
                {f.bio && (
                  <p className="text-sm text-navy-500 dark:text-navy-200 mt-3 leading-relaxed">
                    {f.bio}
                  </p>
                )}
                {f.email && (
                  <a
                    href={`mailto:${f.email}`}
                    className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 mt-3 hover:underline"
                  >
                    <Mail size={13} /> {f.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
