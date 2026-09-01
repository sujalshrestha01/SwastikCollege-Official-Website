import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  BellOff,
  Users,
  CalendarDays,
  Quote,
  Images,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  FileText,
  ChevronDown,
  Menu,
  X,
  Eye,
  FolderKanban,
  Sparkles,
  HelpCircle,
  FileDown,
  Handshake,
  UserCog,
  MessageSquareText,
  Database,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Switch } from "./Ui";
import { updateChatPreferences } from "../../api/client";
import {
  registerServiceWorker,
  checkPushHealth,
  enablePushNotifications,
  disablePushNotifications,
} from "../../api/push";
import { playAlertBeep } from "../../utils/beep";
import { getAdminSocket } from "../../api/chatSocket";

// Grouped, collapsible sidebar navigation — mirrors how most professional
// admin panels (Shopify, WordPress, etc.) organize a growing list of screens
// into logical categories instead of one long flat list.
const FULL_NAV_GROUPS = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Content",
    icon: FolderKanban,
    items: [
      { to: "/admin/blog", label: "Blog Posts", icon: FileText },
      { to: "/admin/notices", label: "Notice Board", icon: Bell },
      { to: "/admin/downloads", label: "Downloads", icon: FileDown },
      { to: "/admin/gallery", label: "Gallery", icon: Images },
    ],
  },
  {
    label: "Academics",
    icon: BookOpen,
    items: [
      { to: "/admin/courses", label: "Courses & Subjects", icon: BookOpen },
      {
        to: "/admin/academics",
        label: "Non-Credit Courses & Workshops",
        icon: Sparkles,
      },
      { to: "/admin/faculty", label: "Faculty", icon: Users },
    ],
  },
  {
    label: "Research & QAA",
    icon: FileText,
    items: [
      {
        to: "/admin/author-guidelines",
        label: "Author Guidelines",
        icon: FileText,
      },
      {
        to: "/admin/call-for-papers",
        label: "Call for Paper",
        icon: FileText,
      },
      { to: "/admin/journals", label: "Journals", icon: BookOpen },
      { to: "/admin/publications", label: "Publications", icon: FileText },
      { to: "/admin/qaa", label: "QAA Documents", icon: ShieldCheck },
    ],
  },
  {
    label: "Community",
    icon: Users,
    items: [
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/testimonials", label: "Testimonials", icon: Quote },
      {
        to: "/admin/placement-partners",
        label: "Investment Partners",
        icon: Handshake,
      },
    ],
  },
  {
    label: "Messages",
    icon: Mail,
    items: [
      { to: "/admin/messages", label: "Inquiries", icon: Mail },
      { to: "/admin/faq", label: "FAQs (Chat Widget)", icon: HelpCircle },
      { to: "/admin/live-chat", label: "Live Chat", icon: MessageSquareText },
      { to: "/admin/knowledge-base", label: "Knowledge Base", icon: Database },
    ],
  },
  {
    label: "Site Configuration",
    icon: Settings,
    items: [
      {
        to: "/admin/visibility",
        label: "Page & Section Visibility",
        icon: Eye,
      },
      { to: "/admin/settings", label: "Site Settings", icon: Settings },
      { to: "/admin/users", label: "User Management", icon: UserCog },
    ],
  },
];

// A qaaVerifier account (see ProtectedRoute.jsx / server restrictQaaVerifier.js)
// is locked to a single screen — the sidebar reflects that directly instead
// of showing a full menu that would just bounce them back on click.
const QAA_ONLY_NAV_GROUPS = [
  {
    items: [
      { to: "/admin/qaa", label: "QAA Documents", icon: ShieldCheck, end: true },
    ],
  },
];

function isGroupActive(group, pathname) {
  return group.items.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
}

function SidebarContent({ onNavigate }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navGroups =
    admin?.role === "qaaVerifier" ? QAA_ONLY_NAV_GROUPS : FULL_NAV_GROUPS;

  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(
      navGroups.map((g) => [
        g.label,
        !g.label || isGroupActive(g, location.pathname),
      ]),
    ),
  );

  useEffect(() => {
    setOpenGroups(() => {
      const active = navGroups.find(
        (g) => g.label && isGroupActive(g, location.pathname),
      );
      return Object.fromEntries(
        navGroups
          .filter((g) => g.label)
          .map((g) => [g.label, active ? g.label === active.label : false]),
      );
    });
  }, [location.pathname]);

  function toggleGroup(label) {
    setOpenGroups((prev) => {
      const willOpen = !prev[label];
      // Accordion behavior: only one group open at a time. Collapse every
      // other group and set this one to the toggled state.
      const next = Object.fromEntries(
        navGroups.filter((g) => g.label).map((g) => [g.label, false]),
      );
      next[label] = willOpen;
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  // Enhanced active item styling + smooth hover transition + shadow glow
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
      isActive
        ? "bg-marigold-400 text-navy-950 font-semibold shadow-sm shadow-marigold-400/20"
        : "text-navy-100/80 hover:text-white hover:bg-white/[0.08]"
    }`;

  return (
    <div className="flex flex-col h-full bg-navy-800">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <p className="font-display text-lg leading-tight text-white tracking-wide">
            Swastik College
          </p>
          <p className="text-xs text-navy-200/80">Admin Control Panel</p>
        </div>
        <button
          onClick={onNavigate}
          className="lg:hidden text-navy-200 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav List with Thin/Modern Scrollbar & Polished Spacing */}
      <nav className="flex-1 overflow-y-auto custom-sidebar-scrollbar py-4 px-3 space-y-3">
        {navGroups.map((group) => {
          // Ungrouped top-level items (e.g. Dashboard)
          if (!group.label) {
            return (
              <div key="ungrouped" className="space-y-1">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={linkClass}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            );
          }

          const open = openGroups[group.label];
          const GroupIcon = group.icon;
          return (
            <div key={group.label} className="space-y-1">
              {/* Polished Group Header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-navy-300/80 hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <GroupIcon
                    size={14}
                    className="text-navy-300/70 group-hover:text-white transition-colors"
                  />
                  <span>{group.label}</span>
                </span>
                {/* Smoother Chevron Rotation */}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ease-in-out text-navy-300/70 group-hover:text-white ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Smooth Height-Transition Accordion */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {/* Submenu Guide Line */}
                  <div className="ml-4 pl-3 border-l border-white/10 space-y-1 my-1">
                    {group.items.map(({ to, label, icon: Icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onNavigate}
                        className={linkClass}
                      >
                        <Icon size={17} className="shrink-0" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0 bg-navy-800">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-100/80 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
        >
          <ExternalLink size={18} className="shrink-0" />
          <span>View live site</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-100/80 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Log out</span>
        </button>
        <div className="pt-2 px-3 text-xs text-navy-300/70 truncate font-mono">
          {admin?.name} · {admin?.role}
        </div>
      </div>
    </div>
  );
}

// "Available" and "Notifications" toggles for live-chat handoff — see
// server/sockets/chatSocket.js for what each one controls server-side.
function LiveChatStatusControls({ hidden }) {
  const { admin, updateAdmin } = useAuth();
  const [busy, setBusy] = useState(null); // "available" | "notifications" | null
  const [notice, setNotice] = useState("");

  if (!admin || hidden) return null;

  async function toggleAvailable(next) {
    setBusy("available");
    const prev = admin.available;
    updateAdmin({ available: next });
    try {
      await updateChatPreferences({ available: next });
    } catch (err) {
      updateAdmin({ available: prev });
      setNotice(err.message || "Couldn't update availability");
    } finally {
      setBusy(null);
    }
  }

  async function toggleNotifications(next) {
    setBusy("notifications");
    setNotice("");
    try {
      if (next) {
        const result = await enablePushNotifications();
        if (!result.ok) {
          const messages = {
            not_supported: "This browser doesn't support push notifications.",
            not_configured:
              "Push notifications aren't set up on the server yet.",
            permission_denied:
              "Notification permission was blocked — allow it in your browser's site settings to enable this.",
          };
          setNotice(
            messages[result.reason] || "Couldn't enable notifications.",
          );
          return;
        }
      } else {
        await disablePushNotifications();
      }
      await updateChatPreferences({ notificationsEnabled: next });
      updateAdmin({ notificationsEnabled: next });
    } catch (err) {
      setNotice(err.message || "Couldn't update notification setting");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div
        className="flex items-center gap-1.5 sm:gap-2"
        title="When off, students asking for a human are told immediately that no admin is available — no 5-minute wait."
      >
        {admin.available ? (
          <UserCheck size={15} className="text-teal-600" />
        ) : (
          <UserX size={15} className="text-navy-400" />
        )}
        <span className="hidden sm:inline text-xs font-medium text-navy-600">
          Available
        </span>
        <Switch
          checked={!!admin.available}
          disabled={busy === "available"}
          onChange={toggleAvailable}
        />
      </div>
      <div
        className="flex items-center gap-1.5 sm:gap-2"
        title="Get notified when a student needs an admin, even with this tab or browser closed."
      >
        {admin.notificationsEnabled ? (
          <Bell size={15} className="text-teal-600" />
        ) : (
          <BellOff size={15} className="text-navy-400" />
        )}
        <span className="hidden sm:inline text-xs font-medium text-navy-600">
          Notifications
        </span>
        <Switch
          checked={!!admin.notificationsEnabled}
          disabled={busy === "notifications"}
          onChange={toggleNotifications}
        />
      </div>
      {notice && (
        <span className="hidden lg:block text-[11px] text-marigold-700 max-w-[220px]">
          {notice}
        </span>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { admin, updateAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [pushWarning, setPushWarning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // A qaaVerifier account is outside the live-chat admin pool entirely —
  // it has no "available"/notifications preferences to manage, and the
  // server already rejects /api/admin-push/* for this role (see
  // restrictQaaVerifier.js), so none of that machinery should even run here.
  const isQaaVerifier = admin?.role === "qaaVerifier";

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Health check runs on every dashboard load (not just fresh logins) —
  // catches any staleness however it happened. Silently repairs when it
  // can; surfaces a real warning when it can't (permission blocked).
  useEffect(() => {
    if (isQaaVerifier || !admin?.notificationsEnabled) {
      setPushWarning(false);
      return;
    }
    checkPushHealth().then((result) => {
      setPushWarning(result.status === "blocked");
    });
  }, [admin?.notificationsEnabled, isQaaVerifier]);

  // Register the service worker once on login so it's ready to receive
  // push events even before the admin has toggled Notifications on.
  useEffect(() => {
    if (admin && !isQaaVerifier) registerServiceWorker();
  }, [admin, isQaaVerifier]);

  // In-app alert: every connected admin socket auto-joins the shared inbox
  // room, so this fires for every logged-in admin regardless of which page
  // they're on — covers the "browser open but tab not focused on chat" case
  // alongside push notifications for the fully-closed-tab case.
  useEffect(() => {
    if (!admin || isQaaVerifier) return;
    const socket = getAdminSocket();
    function handleEscalation(item) {
      if (!admin.notificationsEnabled) return;
      playAlertBeep();
      setAlert({
        studentName: item.studentName,
        preview: item.lastMessagePreview,
      });
    }
    // Fires on every follow-up message too (not just the first escalation)
    // — see server/sockets/chatSocket.js alertAdmins(). Same handler as
    // above since the payload shape matches.
    socket.on("admin:escalation", handleEscalation);
    socket.on("admin:alert", handleEscalation);
    return () => {
      socket.off("admin:escalation", handleEscalation);
      socket.off("admin:alert", handleEscalation);
    };
  }, [admin, isQaaVerifier]);

  // Live cross-device sync: if this admin toggles "Available" or
  // "Notifications" on another device (or another tab), reflect it here
  // instantly — no refresh, no re-login. See notifyAdminPreferencesChanged
  // in server/sockets/chatSocket.js for the broadcast side.
  useEffect(() => {
    if (!admin || isQaaVerifier) return;
    const socket = getAdminSocket();
    function handlePreferencesUpdated(partial) {
      updateAdmin(partial);
    }
    socket.on("admin:preferences_updated", handlePreferencesUpdated);
    return () => {
      socket.off("admin:preferences_updated", handlePreferencesUpdated);
    };
  }, [admin, updateAdmin, isQaaVerifier]);

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 7000);
    return () => clearTimeout(t);
  }, [alert]);

  return (
    <div className="h-screen flex bg-paper overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy-800 text-white flex-col h-full border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy-800 text-white flex flex-col shadow-2xl h-full">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-white border-b border-navy-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-navy-600 hover:text-navy-900 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm text-navy-500">Signed in as</p>
            <p className="text-sm font-semibold text-navy-800 truncate">
              {admin?.name} · {admin?.role}
            </p>
          </div>
          <LiveChatStatusControls hidden={isQaaVerifier} />
        </header>
        {pushWarning && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 shadow-sm flex items-start gap-3 shrink-0">
            <BellOff size={18} className="text-red-500 mt-0.5 shrink-0" />
            <span className="min-w-0 text-sm text-red-700">
              Notifications are switched on, but this browser has blocked them —
              you won't actually receive any here. Allow notifications for this
              site in your browser's settings, then reload this page.
            </span>
          </div>
        )}
        {alert && (
          <button
            onClick={() => {
              setAlert(null);
              navigate("/admin/live-chat");
            }}
            className="mx-4 sm:mx-6 lg:mx-8 mt-4 text-left px-4 py-3 rounded-xl bg-marigold-50 border border-marigold-200 shadow-sm flex items-start gap-3 shrink-0"
          >
            <MessageSquareText
              size={18}
              className="text-marigold-600 mt-0.5 shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-navy-800">
                {alert.studentName || "A student"} needs an admin
              </span>
              <span className="block text-xs text-navy-500 truncate">
                {alert.preview || "Tap to open Live Chat"}
              </span>
            </span>
          </button>
        )}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
