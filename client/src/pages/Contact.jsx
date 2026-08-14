import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { submitContactForm } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

const PROGRAMS = ["BSc. CSIT", "BCA", "General Inquiry"];

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    program: PROGRAMS[0],
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    await submitContactForm(form);
    setStatus("sent");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title="Contact & Admissions"
        description="Get in touch with Swastik College, Kathmandu for admissions inquiries, program information, office hours and directions."
        path="/contact"
        keywords="Swastik College admissions, Swastik College contact, Swastik College Kathmandu address"
      />
      <Section page="contact" section="hero">
        <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-[#3B82F6] uppercase mb-2">
          Admissions
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-3">
          Contact &amp; Admission Inquiry
        </h1>
        <p className="text-navy-400 dark:text-navy-200 max-w-xl mb-10">
          Reach the admissions office directly, or send an inquiry and we'll
          respond within two working days.
        </p>
      </Section>

      <div className="grid lg:grid-cols-5 gap-10">
        <Section page="contact" section="map">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden border border-navy-100 dark:border-navy-700 aspect-[4/3]">
              <iframe
                title="Swastik College location"
                src={
                  settings.mapEmbedUrl ||
                  "https://maps.google.com/maps?q=Swastik%20College%2C%20Chardobato%2C%20Bhaktapur%2C%20Nepal&t=&z=14&ie=UTF8&iwloc=&output=embed"
                }
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="text-marigold-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-navy-500 dark:text-navy-200">
                  {settings.address ||
                    "Chardobato, Bhaktapur, Bagmati Province, Nepal"}
                </p>
              </div>
              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="text-marigold-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-navy-500 dark:text-navy-200">
                  {settings.phone || "+977-1-4000000"}
                </p>
              </div>
              <div className="flex gap-3">
                <Mail size={18} className="text-marigold-500 shrink-0 mt-0.5" />
                <p className="text-sm text-navy-500 dark:text-navy-200">
                  {settings.email || "info.swastikcollege@gmail.com"}
                </p>
              </div>
              <div className="flex gap-3">
                <Clock
                  size={18}
                  className="text-marigold-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-navy-500 dark:text-navy-200">
                  {settings.officeHours || "Sun – Fri, 6:40 AM – 11:30 AM"}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section page="contact" section="form">
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 rounded-xl p-8 text-center">
                <CheckCircle2
                  className="mx-auto text-teal-600 dark:text-teal-400 mb-3"
                  size={32}
                />
                <h3 className="font-display text-xl text-navy dark:text-paper mb-1">
                  Inquiry sent
                </h3>
                <p className="text-sm text-navy-400 dark:text-navy-200">
                  Thanks, {form.name.split(" ")[0] || "there"} — the admissions
                  office will follow up by email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-xl p-6 sm:p-8"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-navy-500 dark:text-navy-200 mb-1.5">
                      Full name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={update("name")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 text-sm text-navy dark:text-paper focus:border-marigold-300 outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-500 dark:text-navy-200 mb-1.5">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 text-sm text-navy dark:text-paper focus:border-marigold-300 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-navy-500 dark:text-navy-200 mb-1.5">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={update("phone")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 text-sm text-navy dark:text-paper focus:border-marigold-300 outline-none"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-500 dark:text-navy-200 mb-1.5">
                      Program of interest
                    </label>
                    <select
                      value={form.program}
                      onChange={update("program")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 text-sm text-navy dark:text-paper focus:border-marigold-300 outline-none"
                    >
                      {PROGRAMS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-500 dark:text-navy-200 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={update("message")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 text-sm text-navy dark:text-paper focus:border-marigold-300 outline-none resize-none"
                    placeholder="Tell us what you'd like to know…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-marigold hover:bg-marigold-500 disabled:opacity-60 text-navy-900 font-semibold text-sm px-6 py-3 rounded-full transition-colors"
                >
                  {status === "sending" ? "Sending…" : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
