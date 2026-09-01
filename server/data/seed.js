import 'dotenv/config';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import Notice from '../models/Notice.js';
import Course from '../models/Course.js';
import Admin from '../models/Admin.js';
import SiteSettings from '../models/SiteSettings.js';
import Faculty from '../models/Faculty.js';
import Event from '../models/Event.js';
import Testimonial from '../models/Testimonial.js';
import GalleryEvent from '../models/Gallery.js';
import Blog from '../models/Blog.js';
import SkillCourse from '../models/SkillCourse.js';
import Workshop from '../models/Workshop.js';
import Faq from '../models/Faq.js';

const notices = [
  {
    title: 'BSc. CSIT & BCA Entrance Exam Routine Published',
    category: 'Admissions',
    date: new Date('2026-07-20'),
    excerpt: 'Entrance examination for the 2026 intake will be held at the main campus hall. Admit cards available from the exam section.',
    fileUrl: '/notices/entrance-routine.pdf',
  },
  {
    title: 'Second Semester Final Examination Routine',
    category: 'Exams',
    date: new Date('2026-07-18'),
    excerpt: "Final examinations for all second semester programs begin next month. Check your program page for the detailed routine.",
    fileUrl: '/notices/sem2-final-routine.pdf',
  },
  {
    title: 'Annual Tech Fest "Swastik Byte" — Registration Open',
    category: 'Events',
    date: new Date('2026-07-15'),
    excerpt: "The IT Club invites all students to register for hackathons, robotics and design competitions at this year's tech fest.",
    fileUrl: '/notices/techfest-2026.pdf',
  },
  {
    title: 'Scholarship Applications for Academically Excellent Students',
    category: 'General',
    date: new Date('2026-07-10'),
    excerpt: 'Students with outstanding academic performance in the previous semester can apply for merit-based fee waivers.',
    fileUrl: '/notices/scholarship-2026.pdf',
  },
  {
    title: 'Library Extended Hours During Exam Season',
    category: 'General',
    date: new Date('2026-07-05'),
    excerpt: 'The central library will remain open until 9 PM on weekdays throughout the examination period.',
    fileUrl: '/notices/library-hours.pdf',
  },
];

const courses = [
  {
    slug: 'bsc-csit',
    name: 'BSc. CSIT',
    tagline: 'Computer Science & Information Technology',
    duration: '4 years · 8 semesters',
    seats: 48,
    order: 1,
    description:
      'A TU-affiliated program covering programming, systems, networks and applied AI, built for students who want to design and ship real software.',
    eligibility: [
      'Completed +2 / A-Level in Science with Computer Science or Mathematics',
      'Minimum second division or GPA 2.0 in +2',
      'Must pass the CSIT entrance examination',
    ],
    semesters: [
      {
        title: 'Semester I',
        subjects: [
          { name: 'Introduction to Information Technology', code: 'CSC109', creditHours: 3 },
          { name: 'C Programming', code: 'CSC110', creditHours: 3 },
          { name: 'Physics', code: 'PHY104', creditHours: 3 },
          { name: 'Mathematics I', code: 'MTH104', creditHours: 3 },
        ],
      },
      {
        title: 'Semester II',
        subjects: [
          { name: 'Digital Logic', code: 'CSC160', creditHours: 3 },
          { name: 'Object Oriented Programming', code: 'CSC161', creditHours: 3 },
          { name: 'Discrete Structures', code: 'CSC162', creditHours: 3 },
          { name: 'Mathematics II', code: 'MTH164', creditHours: 3 },
        ],
      },
      {
        title: 'Semester III',
        subjects: [
          { name: 'Data Structures & Algorithms', code: 'CSC206', creditHours: 3 },
          { name: 'Database Systems', code: 'CSC209', creditHours: 3 },
          { name: 'Microprocessor', code: 'CSC211', creditHours: 3 },
          { name: 'Numerical Methods', code: 'CSC212', creditHours: 3 },
        ],
      },
      {
        title: 'Semester IV',
        subjects: [
          { name: 'Operating Systems', code: 'CSC258', creditHours: 3 },
          { name: 'Software Engineering', code: 'CSC259', creditHours: 3 },
          { name: 'Computer Networks', code: 'CSC261', creditHours: 3 },
          { name: 'Applied Statistics', code: 'STA260', creditHours: 3 },
        ],
      },
    ],
    syllabusUrl: '/syllabus/bsc-csit.pdf',
  },
  {
    slug: 'bca',
    name: 'BCA',
    tagline: 'Bachelor of Computer Application',
    duration: '4 years · 8 semesters',
    seats: 48,
    order: 2,
    description:
      'An application-focused computing degree emphasizing enterprise software, web platforms and IT management for the local industry.',
    eligibility: [
      'Completed +2 / A-Level in any stream',
      'Minimum second division or GPA 2.0 in +2',
      'Must pass the BCA entrance examination',
    ],
    semesters: [
      {
        title: 'Semester I',
        subjects: [
          { name: 'Computer Fundamentals', code: 'BCA101', creditHours: 3 },
          { name: 'English I', code: 'ENG101', creditHours: 3 },
          { name: 'Society and Technology', code: 'SOC102', creditHours: 3 },
          { name: 'Mathematics I', code: 'MTH104', creditHours: 3 },
        ],
      },
      {
        title: 'Semester II',
        subjects: [
          { name: 'C Programming', code: 'BCA151', creditHours: 3 },
          { name: 'Digital Logic', code: 'BCA152', creditHours: 3 },
          { name: 'Financial Accounting', code: 'MGT153', creditHours: 3 },
          { name: 'Mathematics II', code: 'MTH164', creditHours: 3 },
        ],
      },
    ],
    syllabusUrl: '/syllabus/bca.pdf',
  },
];

const faculty = [
  {
    name: 'Dr. Ramesh Sharma',
    designation: 'Principal',
    department: 'Administration',
    qualification: 'PhD in Computer Science',
    bio: 'Over 20 years in higher education leadership and curriculum design.',
    order: 1,
  },
  {
    name: 'Er. Sunita Poudel',
    designation: 'Head of Department, BSc. CSIT',
    department: 'Computer Science',
    qualification: 'MSc in Computer Engineering',
    bio: 'Specializes in software engineering and database systems.',
    order: 2,
  },
  {
    name: 'Mr. Bikash Thapa',
    designation: 'Senior Lecturer',
    department: 'Business Studies',
    qualification: 'MBA, MPhil in Management',
    bio: 'Teaches management and business communication courses.',
    order: 3,
  },
];

const events = [
  {
    title: 'Swastik Byte 2026: Hackathon Finals',
    description: 'A 24-hour hackathon finale featuring student teams building real-world software.',
    date: new Date('2026-08-14T09:00:00'),
    location: 'Main Campus Auditorium',
    type: 'Fest',
    isFeatured: true,
  },
  {
    title: 'Alumni Homecoming & Networking Evening',
    description: 'An evening for graduates to reconnect and network with current students.',
    date: new Date('2026-08-02T17:00:00'),
    location: 'College Grounds',
    type: 'Event',
  },
  {
    title: 'Guest Lecture: Careers in Applied AI',
    description: 'An industry expert discusses career paths in applied AI and machine learning.',
    date: new Date('2026-07-29T11:00:00'),
    location: 'Seminar Hall',
    type: 'Seminar',
  },
];

const testimonials = [
  {
    name: 'Anisha Rai',
    role: 'BSc. CSIT, Batch 2022',
    quote: 'The IT Club gave me my first real project experience before I ever wrote a line of code for a job.',
    order: 1,
  },
  {
    name: 'Bishal Shrestha',
    role: 'BCA, Batch 2020',
    quote: 'Small class sizes meant every professor knew my name — and my weak spots.',
    order: 2,
  },
  {
    name: 'Prakriti Gurung',
    role: 'BSc. CSIT, Batch 2021',
    quote: 'The faculty pushed me to present my final year project at a national conference — that changed the direction of my career.',
    order: 3,
  },
];

const siteSettingsData = {
  key: 'main',
  collegeName: 'Swastik College',
  collegeShortName: 'Swastik',
  tagline: 'Shaping Careers, Building Futures',
  establishedYear: '2005',
  affiliation: 'Tribhuvan University (TU)',
  heroHeadline: 'Shaping Careers, Building Futures',
  heroSubheadline:
    'A TU-affiliated college offering BSc. CSIT and BCA programs, built around small classes and real project experience.',
  heroCtaText: 'Explore Programs',
  heroCtaLink: '/programs',
  aboutSummary:
    'Swastik College has been preparing students for technology and business careers since 2005, combining a TU-affiliated curriculum with hands-on project work and a close-knit campus community.',
  missionStatement: 'To provide accessible, high-quality higher education that prepares students for real careers.',
  visionStatement: 'To be a leading college recognized for producing industry-ready graduates.',
  address: 'Putalisadak, Kathmandu, Nepal',
  phone: '+977-1-4123456',
  email: 'info@swastikcollege.edu.np',
  officeHours: 'Sun–Fri, 9:00 AM – 4:00 PM',
  socialLinks: {
    facebook: 'https://facebook.com/swastikcollege',
    instagram: 'https://instagram.com/swastikcollege',
    youtube: '',
    linkedin: '',
    twitter: '',
    tiktok: '',
  },
  stats: [
    { label: 'Students enrolled', value: 2400, suffix: '+' },
    { label: 'Graduates since founding', value: 6100, suffix: '+' },
    { label: 'Full-time faculty', value: 86, suffix: '' },
    { label: 'IT Club projects shipped', value: 34, suffix: '' },
  ],
  footerNote: 'Affiliated to Tribhuvan University. All rights reserved.',
  announcementBarText: 'Admissions open for the 2026 intake — apply before the deadline!',
  announcementBarEnabled: true,
};

async function seed() {
  await connectDB();

  await Notice.deleteMany({});
  await Course.deleteMany({});
  await Faculty.deleteMany({});
  await Event.deleteMany({});
  await Testimonial.deleteMany({});
  await GalleryEvent.deleteMany({});
  await Blog.deleteMany({});
  await SkillCourse.deleteMany({});
  await Workshop.deleteMany({});
  await Faq.deleteMany({});

  await Notice.insertMany(notices);
  await Course.insertMany(courses);
  await Faculty.insertMany(faculty);
  await Event.insertMany(events);
  await Testimonial.insertMany(testimonials);

  await SkillCourse.insertMany([
    { name: 'Python Programming', duration: '4 Weeks', order: 1,
      description: 'Master Python fundamentals, object-oriented concepts, automated scripts, and working with external data APIs.' },
    { name: 'MERN Stack Development', duration: '8 Weeks', order: 2,
      description: 'Build scalable full-stack web applications using MongoDB, Express.js, React, and Node.js.' },
    { name: 'Cybersecurity & Linux Essentials', duration: '5 Weeks', order: 3,
      description: 'Gain hands-on skills with Linux terminal navigation, bash scripting, network security, and access controls.' },
  ]);

  await Workshop.insertMany([
    { name: 'Git & GitHub Workflow', duration: '3 Days (Weekend)', startDate: new Date('2026-10-14'),
      type: 'Hands-on Workshop', status: 'Enrollment Open', order: 1,
      description: 'Practical deep-dive into git version control, branch management, resolving merge conflicts, and team collaboration.',
      highlights: ['Interactive Rebase & Branching', 'Resolving Complex Merge Conflicts', 'PR Reviews & GitHub Workflows', 'CI/CD Pipeline Fundamentals'],
      enrollUrl: '' },
    { name: 'AWS Cloud Fundamentals', duration: '1 Day Intensive', startDate: new Date('2026-10-22'),
      type: 'Live BootCamp', status: 'Enrollment Open', order: 2,
      description: 'Deploy your first application on AWS. Learn EC2 provisioning, S3 bucket storage, and basic IAM role policies.',
      highlights: ['EC2 Instance Provisioning', 'S3 Bucket Permissions & Hosting', 'IAM User Security Policies', 'Cloud Domain Configuration'],
      enrollUrl: '' },
  ]);

  await Faq.insertMany([
    { question: 'What programs do you offer?', order: 1,
      answer: 'We offer TU-affiliated BSc. CSIT and BCA programs, plus non-credit certification courses and live workshops. Check the Academics page for full details.' },
    { question: 'How do I apply for admission?', order: 2,
      answer: "Use the Contact page's admission inquiry form, or message us here in chat, and the admissions office will follow up by email within two working days." },
    { question: 'Where is the campus located?', order: 3,
      answer: 'Chardobato, Bhaktapur, Bagmati Province, Nepal — see the map on our Contact page for directions.' },
    { question: 'What are your office hours?', order: 4,
      answer: 'Sunday to Friday, 6:40 AM to 11:30 AM.' },
  ]);
  // Gallery events and blog posts start empty — the admin uploads real photos
  // and writes real posts from the admin panel (Gallery / Blog Posts screens).

  await SiteSettings.findOneAndUpdate({ key: 'main' }, siteSettingsData, { upsert: true, new: true });

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@swastikcollege.edu.np').toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'College Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'superadmin',
    });
    console.log(`Created admin account: ${adminEmail} (password from ADMIN_PASSWORD / default)`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  console.log(
    `Seeded ${notices.length} notices, ${courses.length} courses, ${faculty.length} faculty, ${events.length} events, ${testimonials.length} testimonials, and site settings.`
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
