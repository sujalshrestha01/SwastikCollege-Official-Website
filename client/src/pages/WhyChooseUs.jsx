// client/src/pages/WhyChooseUs.jsx — replace the whole file
import React from "react";
import {
  GraduationCap,
  Users,
  Lightbulb,
  HeartHandshake,
  Trophy,
  Target,
  Compass,
  BookOpenCheck,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const ICON_MAP = {
  GraduationCap,
  Users,
  Lightbulb,
  HeartHandshake,
  Trophy,
  Target,
  Compass,
  BookOpenCheck,
};

const DEFAULT_FEATURES = [
  {
    icon: "GraduationCap",
    title: "TU Affiliated Programs",
    description:
      "Offering industry-aligned BCA & B.Sc. CSIT degrees with standard 4-year, 8-semester curriculum excellence.",
  },
  {
    icon: "Users",
    title: "Industry Partnerships & 100% Placement",
    description:
      "Direct ties with top IT & Fintech giants like F1Soft and eSewa to provide internships, workshops, and career readiness.",
  },
  {
    icon: "Target",
    title: "Practical & Professional Training",
    description:
      "Beyond standard theory, students gain hands-on expertise through continuous lab work, bootcamps, and real projects.",
  },
  {
    icon: "HeartHandshake",
    title: "Experienced Faculty",
    description:
      "Guided by seasoned educators, tech leaders, and vibrant entrepreneurs dedicated to student mentorship.",
  },
];

export default function WhyChooseUs() {
  const { settings } = useSettings();
  const features = settings.whyChooseUs?.length
    ? settings.whyChooseUs
    : DEFAULT_FEATURES;

  return (
    <section className="w-full  bg-slate-50/80 dark:bg-navy-900/90 py-16 px-4 sm:px-6 lg:px-8  border-slate-200/60 dark:border-navy-700 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#D9383A] dark:text-[#3B82F6]">
            Excellence in Education
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
            Why{" "}
            <span className="text-[#D9383A] dark:text-[#3B82F6]">
              Choose Us?
            </span>
          </h2>
          <p className="text-slate-600 dark:text-navy-100 text-sm sm:text-base mt-3 leading-relaxed">
            Empowering students with quality education, modern facilities, and
            real-world tech exposure to shape the next generation of leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || GraduationCap;
            return (
              <div
                key={index}
                className="bg-white dark:bg-navy-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-xs hover:shadow-md transition-all duration-300 flex items-start gap-5 group"
              >
                <div className="p-3 bg-red-50 dark:bg-navy-700/60 group-hover:bg-[#D9383A] dark:group-hover:bg-[#1E3A8A] rounded-xl transition-colors duration-300 shrink-0">
                  <Icon className="w-6 h-6 text-[#D9383A] dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-navy-100 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
