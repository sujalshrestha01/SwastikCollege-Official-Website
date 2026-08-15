import React from "react";

// Import local assets from your assets directory
import megaCollegeLogo from "../../assets/mega-college.png";
import megaSchoolLogo from "../../assets/mega-school.png";

export default function SisterInstitutes() {
  return (
    <section className="w-full bg-white dark:bg-navy-900/90 py-14 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-16 lg:space-y-24">
        {/* Main Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Our{" "}
            <span className="text-[#D9383A] dark:text-[#3B82F6]">
              Sister Institutes
            </span>
          </h2>
          <p className="text-slate-500 dark:text-navy-100 text-sm sm:text-base mt-2">
            Fostering academic excellence across all levels of education.
          </p>
        </div>

        {/* 1. NEPAL MEGA COLLEGE (Logo Left, Content Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Logo Container */}
          <div className="flex items-center justify-center p-6 bg-slate-50/50 dark:bg-white/95 rounded-2xl border border-slate-100 dark:border-navy-700">
            <img
              src={megaCollegeLogo}
              alt="Nepal Mega College Logo"
              className="w-full max-w-sm sm:max-w-md h-auto object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Nepal Mega College
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-navy-100 text-sm sm:text-base leading-relaxed">
              <p>
                Established in the year 2011, Nepal MEGA College is one of the
                renowned colleges in Kathmandu. It was founded by a highly
                experienced team of teachers in association with educationists
                and vibrant entrepreneurs.
              </p>
              <p>
                As its motto mega centre for excellence, the college has
                witnessed its outstanding academic performance scoring excellent
                results in board examinations and bagging unparalleled success
                in competitive examinations of medicine, engineering,
                paramedical and management courses. Due to its high standards,
                comprehensive facilities and reputation for excellence, the
                college has attracted students from all over the country.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://www.nepalmegacollege.edu.np/"
                className="inline-block bg-[#D9383A] dark:bg-[#3B82F6] hover:bg-[#c22e30] dark:hover:bg-blue-600 text-white font-medium text-sm sm:text-base px-6 py-2.5 rounded shadow-md hover:shadow-lg transition-all duration-200"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-slate-100 dark:bg-navy-700 max-w-4xl mx-auto" />

        {/* 2. NEPAL MEGA SCHOOL (Content Left, Logo Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 order-2 lg:order-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Nepal Mega School
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-navy-100 text-sm sm:text-base leading-relaxed">
              <p>
                Situated at Kathmandu, Nepal MEGA School is one of the leading
                school in Nepal. Established with mega vision, the school aims
                to provide quality education to the youth from all sections of
                the society at affordable cost and to make them responsible
                citizens capable of serving the nation.
              </p>
              <p>
                The school provides an open, caring and multi-cultural learning
                environment built on the core values of integrity,
                responsibility and dignity. The school has an unwavering
                commitment to develop it into a mega center for excellence.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://www.nepalmegacollege.edu.np/"
                className="inline-block bg-[#D9383A] dark:bg-[#3B82F6] hover:bg-[#c22e30] dark:hover:bg-blue-600 text-white font-medium text-sm sm:text-base px-6 py-2.5 rounded shadow-md hover:shadow-lg transition-all duration-200"
              >
                Learn more
              </a>
            </div>
          </div>

          {/* Logo Container */}
          <div className="flex items-center justify-center p-6 bg-slate-50/50 dark:bg-white/95 rounded-2xl border border-slate-100 dark:border-navy-700 order-1 lg:order-2">
            <img
              src={megaSchoolLogo}
              alt="Nepal Mega School Logo"
              className="w-full max-w-sm sm:max-w-md h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
