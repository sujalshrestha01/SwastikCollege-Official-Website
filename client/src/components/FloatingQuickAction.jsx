import { useState } from "react";
import { Link } from "react-router";
import { X, MessageCircle, ClipboardEdit, MessageSquareText } from "lucide-react";
import ChatWithAdmissions from "./ChatWithAdmissions";
import { useSettings } from "../context/SettingsContext";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

export default function FloatingQuickAction() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { isPageEnabled } = useSettings();
  const contactEnabled = isPageEnabled("contact");

  // Stop the page underneath from scrolling while the chat panel is open.
  useLockBodyScroll(chatOpen);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {chatOpen && <ChatWithAdmissions onClose={() => setChatOpen(false)} />}

      {open && !chatOpen && (
        <div className="flex flex-col gap-2 items-end animate-[fadeIn_0.15s_ease-out]">
          <button
            onClick={() => {
              setChatOpen(true);
              setOpen(false);
            }}
            className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 shadow-lg text-navy dark:text-paper text-sm font-medium pl-4 pr-3 py-2.5 rounded-full hover:border-marigold-300 active:scale-95 transition-all"
          >
            Chat with Admissions
            <span className="w-7 h-7 rounded-full bg-teal-50 dark:bg-navy-700 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <MessageCircle size={14} />
            </span>
          </button>
          {contactEnabled && (
            <Link
              to="/contact"
              className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 shadow-lg text-navy dark:text-paper text-sm font-medium pl-4 pr-3 py-2.5 rounded-full hover:border-marigold-300 active:scale-95 transition-all"
              style={{ animationDelay: "40ms" }}
            >
              Send Inquiry
              <span className="w-7 h-7 rounded-full bg-marigold-50 dark:bg-navy-700 text-marigold-600 dark:text-marigold-300 flex items-center justify-center">
                <ClipboardEdit size={14} />
              </span>
            </Link>
          )}
        </div>
      )}
      <button
        onClick={() => {
          if (chatOpen) {
            setChatOpen(false);
            return;
          }
          setOpen((o) => !o);
        }}
        aria-label={
          open || chatOpen ? "Close quick actions" : "Open quick actions"
        }
        aria-expanded={open || chatOpen}
        className="w-14 h-14 rounded-full rounded-tr-lg bg-marigold hover:bg-marigold-500 text-navy-900 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {open || chatOpen ? <X size={22} /> : <MessageSquareText size={26} />}
      </button>
    </div>
  );
}
