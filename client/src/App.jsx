import { Routes, Route, useLocation, Navigate } from "react-router";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import NotificationTicker from "./components/NotificationTicker";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingQuickAction from "./components/FloatingQuickAction";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import CourseDetail from "./pages/CourseDetail";
import SemesterSyllabus from "./pages/SemesterSyllabus";
import NoticeBoard from "./pages/NoticeBoard";
import Downloads from "./pages/Downloads";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Faculty from "./pages/Faculty";
import Blog from "./pages/Blog"; // Public Blog Page
import AuthorGuidelines from "./pages/AuthorGuidelines";
import CallForPaper from "./pages/CallForPaper";
import Journals from "./pages/Journals";
import Publications from "./pages/Publications";
import Qaa from "./pages/Qaa";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AcceptInvite from "./pages/admin/AcceptInvite";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminDownloads from "./pages/admin/AdminDownloads";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPlacementPartners from "./pages/admin/AdminPlacementPartners";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVisibility from "./pages/admin/AdminVisibility";
import AdminAcademics from "./pages/admin/AdminAcademics";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminLiveChat from "./pages/admin/AdminLiveChat";
import AdminKnowledgeBase from "./pages/admin/AdminKnowledgeBase";
import AdminAuthorGuidelines from "./pages/admin/AdminAuthorGuidelines";
import AdminCallForPapers from "./pages/admin/AdminCallForPapers";
import AdminJournals from "./pages/admin/AdminJournals";
import AdminPublications from "./pages/admin/AdminPublications";
import AdminQaa from "./pages/admin/AdminQaa";
import NonCreditCourses from "./pages/NonCreditCourses";
import { PageGate } from "./components/Visibility";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicSite() {
  const { settings, isPageEnabled, isSectionVisible } = useSettings();
  const isBlogDisabled =
    settings?.features?.blogDisabled || !isPageEnabled("blog");

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-navy-900 transition-colors">
      {isSectionVisible("global", "notificationTicker") && (
        <NotificationTicker />
      )}
      {isSectionVisible("global", "navbar") && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/programs"
            element={
              <PageGate page="programs">
                <Programs />
              </PageGate>
            }
          />
          <Route
            path="/programs/:slug"
            element={
              <PageGate page="programs">
                <CourseDetail />
              </PageGate>
            }
          />
          <Route
            path="/programs/:slug/semester/:semesterSlug"
            element={
              <PageGate page="programs">
                <SemesterSyllabus />
              </PageGate>
            }
          />
          <Route
            path="/notices"
            element={
              <PageGate page="notices">
                <NoticeBoard />
              </PageGate>
            }
          />
          <Route
            path="/downloads"
            element={
              <PageGate page="downloads">
                <Downloads />
              </PageGate>
            }
          />
          <Route
            path="/about"
            element={
              <PageGate page="about">
                <About />
              </PageGate>
            }
          />
          <Route
            path="/faculty"
            element={
              <PageGate page="faculty">
                <Faculty />
              </PageGate>
            }
          />
          <Route
            path="/contact"
            element={
              <PageGate page="contact">
                <Contact />
              </PageGate>
            }
          />
          <Route
            path="/gallery"
            element={
              <PageGate page="gallery">
                <Gallery />
              </PageGate>
            }
          />
          <Route
            path="/programs/non-credit"
            element={
              <PageGate page="programs">
                <NonCreditCourses />
              </PageGate>
            }
          />
          <Route
            path="/research/author-guidelines"
            element={
              <PageGate page="research">
                <AuthorGuidelines />
              </PageGate>
            }
          />
          <Route
            path="/research/call-for-paper"
            element={
              <PageGate page="research">
                <CallForPaper />
              </PageGate>
            }
          />
          <Route
            path="/research/journals"
            element={
              <PageGate page="research">
                <Journals />
              </PageGate>
            }
          />
          <Route
            path="/publications"
            element={
              <PageGate page="publications">
                <Publications />
              </PageGate>
            }
          />
          <Route
            path="/qaa"
            element={
              <PageGate page="qaa">
                <Qaa />
              </PageGate>
            }
          />

          {/* Blog visibility respects both the legacy quick-toggle and the generic
              page visibility engine, so either one hides the page. */}
          <Route
            path="/blog"
            element={isBlogDisabled ? <Navigate to="/404" replace /> : <Blog />}
          />
          <Route
            path="/blog/:slug"
            element={isBlogDisabled ? <Navigate to="/404" replace /> : <Blog />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {isSectionVisible("global", "footer") && <Footer />}
      {isSectionVisible("global", "floatingQuickAction") && (
        <FloatingQuickAction />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/accept-invite" element={<AcceptInvite />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="academics" element={<AdminAcademics />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="downloads" element={<AdminDownloads />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route
                path="placement-partners"
                element={<AdminPlacementPartners />}
              />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="faq" element={<AdminFAQ />} />
              <Route path="live-chat" element={<AdminLiveChat />} />
              <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
              <Route
                path="author-guidelines"
                element={<AdminAuthorGuidelines />}
              />
              <Route path="call-for-papers" element={<AdminCallForPapers />} />
              <Route path="journals" element={<AdminJournals />} />
              <Route path="publications" element={<AdminPublications />} />
              <Route path="qaa" element={<AdminQaa />} />
              <Route path="visibility" element={<AdminVisibility />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
            <Route path="/*" element={<PublicSite />} />
          </Routes>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
