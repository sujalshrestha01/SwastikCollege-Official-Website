import { Link } from "react-router";
import { ShieldCheck, LogIn } from "lucide-react";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

// Quality Assurance & Accreditation documents are never shown on the public
// site — only an authorized reviewer with a login issued by the college can
// see them, via /admin/qaa (see server/routes/qaa.js: GET is requireAuth,
// and server/middleware/restrictQaaVerifier.js scopes that login to nothing
// else). This page is just the public-facing gate: it explains what QAA is
// and points to the login, and that's all.
export default function Qaa() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <SEO
        title="Quality Assurance & Accreditation (QAA)"
        description="Quality Assurance & Accreditation access for Swastik College is restricted to authorized reviewers."
        path="/qaa"
      />
      <Section page="qaa" section="hero">
        <div className="flex justify-center mb-4 text-[#D9383A] dark:text-[#3B82F6]">
          <ShieldCheck size={36} />
        </div>
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#D9383A] dark:text-[#3B82F6] mb-2">
          Accreditation
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-4">
          Quality Assurance & Accreditation
        </h1>
        <p className="text-sm text-navy-500 dark:text-navy-300 mb-8 max-w-md mx-auto">
          QAA documents are only accessible to authorized reviewers. If you've
          been issued a login by the college to review these documents,
          please sign in below.
        </p>
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 bg-marigold hover:bg-marigold-500 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
        >
          <LogIn size={16} />
          Reviewer Login
        </Link>
      </Section>
    </div>
  );
}
