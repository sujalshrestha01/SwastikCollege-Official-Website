// Fallback/demo content — mirrors the shape returned by the Express API.
// Used automatically if the backend isn't running, so the UI is always viewable.

export const metrics = [
  { label: "Students enrolled", value: 2400, suffix: "+" },
  { label: "Graduates since founding", value: 6100, suffix: "+" },
  { label: "Full-time faculty", value: 86 },
  { label: "IT Club projects shipped", value: 34 },
];

export const programs = [
  {
    slug: "bsc-csit",
    name: "BSc. CSIT",
    tagline: "Computer Science & Information Technology",
    duration: "4 years · 8 semesters",
    seats: 48,
    description:
      "A TU-affiliated program covering programming, systems, networks and applied AI, built for students who want to design and ship real software.",
    eligibility: [
      "Completed +2 / A-Level in Science with Computer Science or Mathematics",
      "Minimum second division or GPA 2.0 in +2",
      "Must pass the CSIT entrance examination",
    ],
    semesters: [
      {
        title: "Semester I",
        courses: [
          "Introduction to Information Technology",
          "C Programming",
          "Physics",
          "Mathematics I",
        ],
      },
      {
        title: "Semester II",
        courses: [
          "Digital Logic",
          "Object Oriented Programming",
          "Discrete Structures",
          "Mathematics II",
        ],
      },
      {
        title: "Semester III",
        courses: [
          "Data Structures & Algorithms",
          "Database Systems",
          "Microprocessor",
          "Numerical Methods",
        ],
      },
      {
        title: "Semester IV",
        courses: [
          "Operating Systems",
          "Software Engineering",
          "Computer Networks",
          "Applied Statistics",
        ],
      },
    ],
    syllabusUrl: "/syllabus/bsc-csit.pdf",
  },
  {
    slug: "bca",
    name: "BCA",
    tagline: "Bachelor of Computer Application",
    duration: "4 years · 8 semesters",
    seats: 48,
    description:
      "An application-focused computing degree emphasizing enterprise software, web platforms and IT management for the local industry.",
    eligibility: [
      "Completed +2 / A-Level in any stream",
      "Minimum second division or GPA 2.0 in +2",
      "Must pass the BCA entrance examination",
    ],
    semesters: [
      {
        title: "Semester I",
        courses: [
          "Computer Fundamentals",
          "English I",
          "Society and Technology",
          "Mathematics I",
        ],
      },
      {
        title: "Semester II",
        courses: [
          "C Programming",
          "Digital Logic",
          "Financial Accounting",
          "Mathematics II",
        ],
      },
      {
        title: "Semester III",
        courses: [
          "Data Structures",
          "System Analysis & Design",
          "Statistics I",
          "Web Technology",
        ],
      },
      {
        title: "Semester IV",
        courses: [
          "Database Management Systems",
          "Software Engineering",
          "Operating Systems",
          "Statistics II",
        ],
      },
    ],
    syllabusUrl: "/syllabus/bca.pdf",
  },
];

export const notices = [
  {
    id: "n1",
    title: "BSc. CSIT & BCA Entrance Exam Routine Published",
    category: "Admissions",
    date: "2026-07-20",
    excerpt:
      "Entrance examination for the 2026 intake will be held at the main campus hall. Admit cards available from the exam section.",
    fileUrl: "/notices/entrance-routine.pdf",
  },
  {
    id: "n2",
    title: "Second Semester Final Examination Routine",
    category: "Exams",
    date: "2026-07-18",
    excerpt:
      "Final examinations for all second semester programs begin next month. Check your program page for the detailed routine.",
    fileUrl: "/notices/sem2-final-routine.pdf",
  },
  {
    id: "n3",
    title: 'Annual Tech Fest "Swastik Byte" — Registration Open',
    category: "Events",
    date: "2026-07-15",
    excerpt:
      "The IT Club invites all students to register for hackathons, robotics and design competitions at this year\u2019s tech fest.",
    fileUrl: "/notices/techfest-2026.pdf",
  },
  {
    id: "n4",
    title: "Scholarship Applications for Academically Excellent Students",
    category: "General",
    date: "2026-07-10",
    excerpt:
      "Students with outstanding academic performance in the previous semester can apply for merit-based fee waivers.",
    fileUrl: "/notices/scholarship-2026.pdf",
  },
  {
    id: "n5",
    title: "Library Extended Hours During Exam Season",
    category: "General",
    date: "2026-07-05",
    excerpt:
      "The central library will remain open until 9 PM on weekdays throughout the examination period.",
    fileUrl: "/notices/library-hours.pdf",
  },
];

export const newsEvents = [
  {
    id: "e1",
    title: "Swastik Byte 2026: Hackathon Finals",
    date: "2026-08-14",
    type: "Event",
  },
  {
    id: "e2",
    title: "Alumni Homecoming & Networking Evening",
    date: "2026-08-02",
    type: "Event",
  },
  {
    id: "e3",
    title: "Guest Lecture: Careers in Applied AI",
    date: "2026-07-29",
    type: "Event",
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "Anisha Rai",
    role: "BSc. CSIT, Batch 2022",
    quote:
      "The IT Club gave me my first real project experience before I ever wrote a line of code for a job.",
  },
  {
    id: "t2",
    name: "Bishal Shrestha",
    role: "BCA, Batch 2020",
    quote:
      "Small class sizes meant every professor knew my name — and my weak spots.",
  },
  {
    id: "t3",
    name: "Prakriti Gurung",
    role: "BSc. CSIT, Batch 2021",
    quote:
      "The faculty pushed me to present my final year project at a national conference — that changed the direction of my career.",
  },
];

export const nextEvent = {
  title: "Swastik Byte 2026 — Hackathon Finals",
  date: "2026-08-14T09:00:00",
};
