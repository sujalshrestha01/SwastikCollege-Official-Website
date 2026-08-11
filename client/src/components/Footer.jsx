import { Link } from "react-router";
import { MapPin, Phone, Mail, Hexagon, ShieldCheck } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { resolveImageUrl } from "../api/client";
import logo from "../../assets/swastik-logo.png";

function Facebook(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.6l.4-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function Instagram(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function Linkedin(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function Youtube(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}
function Twitter(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

export default function Footer() {
  const { settings, isPageEnabled } = useSettings();
  const social = settings.socialLinks || {};
  const socialLinks = [
    { key: "facebook", Icon: Facebook, url: social.facebook },
    { key: "instagram", Icon: Instagram, url: social.instagram },
    { key: "youtube", Icon: Youtube, url: social.youtube },
    { key: "linkedin", Icon: Linkedin, url: social.linkedin },
    { key: "twitter", Icon: Twitter, url: social.twitter },
  ].filter((s) => s.url);

  const exploreLinks = [
    { to: "/programs", label: "Academic Programs", page: "programs" },
    { to: "/notices", label: "Notice Board", page: "notices" },
    { to: "/about", label: "About Us", page: "about" },
    { to: "/faculty", label: "Faculty", page: "faculty" },
    { to: "/contact", label: "Contact Us", page: "contact" },
  ].filter((l) => isPageEnabled(l.page));

  return (
    <footer className="bg-navy-900 text-navy-200  pb-8 mt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-y border-navy-700">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <Hexagon className="text-marigold" size={22} fill="#1B2A4A" /> */}
              <img
                src={
                  settings.logoUrl ? resolveImageUrl(settings.logoUrl) : logo
                }
                alt="Logo"
                className="h-10"
              />
              {/* <span className="font-display text-lg text-paper">{settings.collegeName}</span> */}
            </div>
            <p className="text-sm leading-relaxed">{settings.footerNote}</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socialLinks.map(({ key, Icon, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="hover:text-marigold-300 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-paper font-medium text-sm mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {exploreLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="hover:text-marigold-300 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-paper font-medium text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin
                  size={16}
                  className="shrink-0 mt-0.5 text-marigold-300"
                />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address || "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-marigold-300 transition-colors"
                >
                  {settings.address}
                </a>
              </li>
              {settings.phone && (
                <li className="flex gap-2">
                  <Phone
                    size={16}
                    className="shrink-0 mt-0.5 text-marigold-300"
                  />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-marigold-300 transition-colors"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-2">
                  <Mail
                    size={16}
                    className="shrink-0 mt-0.5 text-marigold-300"
                  />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-marigold-300 transition-colors"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-paper font-medium text-sm mb-4">
              Office Hours
            </h4>
            <p className="text-sm font-mono">{settings.officeHours}</p>
            <div className="flex items-center gap-2 mt-5 text-xs text-teal-300">
              <ShieldCheck size={15} />
              {settings.affiliation} · Recognized
            </div>
          </div>
        </div>

        <p className="text-xs text-navy-400 text-center pt-6">
          © {new Date().getFullYear()} {settings.collegeName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
