import { Link } from "react-router";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <SEO title="Page Not Found" path="/404" noindex />
      <p className="font-mono text-marigold-500 text-sm mb-3">404</p>
      <h1 className="font-display text-3xl font-medium text-navy dark:text-paper mb-3">
        Page not found
      </h1>
      <p className="text-navy-400 dark:text-navy-200 mb-8">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex bg-marigold text-navy-900 font-semibold text-sm px-6 py-3 rounded-full"
      >
        Back to Home
      </Link>
    </div>
  );
}
