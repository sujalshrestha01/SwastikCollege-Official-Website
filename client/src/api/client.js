import {
  notices as mockNotices,
  programs as mockPrograms,
  testimonials as mockTestimonials,
  newsEvents as mockEvents,
} from "../data/mockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Root of the API server (without /api) — used to resolve uploaded image paths like /uploads/xyz.jpg
export const SERVER_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

const TOKEN_KEY = "swastik_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Cloudinary image-delivery URLs support inserting transformation params
// right after "/upload/". f_auto lets Cloudinary pick the smallest format
// the visitor's browser supports (WebP/AVIF instead of the original
// JPG/PNG); q_auto picks a quality level that's visually near-identical
// but meaningfully smaller. This typically cuts delivered bytes 50-70%
// with no visible difference — worth doing everywhere images are shown,
// since Cloudinary's free tier bills storage AND delivery bandwidth
// against the same shared credit pool.
function withAutoOptimization(url) {
  if (!/res\.cloudinary\.com/i.test(url)) return url; // not a Cloudinary URL
  if (!/\/image\/upload\//i.test(url)) return url; // only Cloudinary's image-delivery type
  if (/\.pdf($|\?)/i.test(url)) return url; // leave PDFs untouched — original format matters for documents/downloads
  if (/\/upload\/[^/]*f_auto/i.test(url)) return url; // already has a transformation (e.g. PDF thumbnail path)
  return url.replace(/\/upload\//, "/upload/f_auto,q_auto/");
}

// Resolves a stored image path (e.g. "/uploads/abc.jpg") into a full URL the
// browser can load. Absolute URLs (http://, https://) pass through unchanged
// (aside from the Cloudinary optimization above).
export function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return withAutoOptimization(path);
  }
  return `${SERVER_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Cross-origin URLs (e.g. Cloudinary) ignore the HTML `download` attribute —
// browsers just navigate to them instead of downloading (PDFs open inline
// in the viewer instead of saving). Cloudinary's `fl_attachment` flag is
// meant to fix this by making Cloudinary send `Content-Disposition:
// attachment`, but it's unreliable for PDFs stored under the "image"
// resource type (can return a malformed/invalid response). Instead, fetch
// the file as a blob in the browser and save that — this works regardless
// of cross-origin restrictions, since the resulting blob: URL is always
// same-origin from the browser's point of view.
export async function downloadFile(path, filename) {
  const url = resolveImageUrl(path);
  if (!url) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename || url.split("/").pop().split("?")[0] || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

// Opens a file for viewing the same reliable way downloadFile() saves it:
// fetch the actual bytes as a blob, then hand the browser a blob: URL to
// render. Navigating straight to the Cloudinary URL can hit odd content-type
// / inline-rendering behavior on some PDFs ("We can't open this file"); a
// blob URL is served by the browser itself from bytes it already verified,
// so it renders in the native PDF viewer reliably every time.
// IMPORTANT: must call window.open() synchronously in the click handler
// (before the await) to avoid popup blockers — we open a blank tab first,
// then set its location once the blob is ready.
export async function previewFile(path) {
  const url = resolveImageUrl(path);
  if (!url) return;
  const tab = window.open("", "_blank");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (tab) tab.location.href = blobUrl;
  } catch (err) {
    // Fall back to the direct link if the fetch itself fails (e.g. offline)
    if (tab) tab.location.href = url;
    throw err;
  }
}

// Cloudinary can rasterize page 1 of a stored PDF into a JPG on its own
// servers — no client-side PDF rendering needed. This replaces relying on
// react-pdf/pdf.js in the browser (which needs its own worker script from a
// CDN and can fail on version mismatches or CORS on range-requests). Only
// works for Cloudinary-hosted PDFs; anything else falls back to null so the
// caller can show a generic file icon instead.
export function getPdfThumbnailUrl(path) {
  const url = resolveImageUrl(path);
  if (!url || !/res\.cloudinary\.com/i.test(url)) return null;
  if (!/\.pdf($|\?)/i.test(url)) return null;
  // Insert a transformation right after /upload/: grab page 1, fit to a
  // reasonable thumbnail width, convert to jpg.
  return url
    .replace(/\/upload\//, "/upload/pg_1,w_400,c_fit,f_jpg,q_auto/")
    .replace(/\.pdf($|\?)/i, ".jpg$1");
}

async function safeFetch(path, fallback, options) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[api] falling back to demo data for ${path}:`, err.message);
    return fallback;
  }
}

// Like safeFetch, but for admin calls where a failure must surface (no silent fallback).
async function apiCall(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return body;
}

// ---------- Public reads (fall back to demo data if API is offline) ----------
export function getNotices(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return safeFetch(`/notices${qs ? `?${qs}` : ""}`, mockNotices);
}
export function getDownloads() {
  return safeFetch("/downloads", []);
}
export function getCourses(opts = {}) {
  const qs = opts.all ? "?all=true" : "";
  return safeFetch(`/courses${qs}`, mockPrograms);
}
export function getCourse(slug) {
  return safeFetch(
    `/courses/${slug}`,
    mockPrograms.find((p) => p.slug === slug) || null,
  );
}
export function getSettings() {
  return safeFetch("/settings", null);
}
export function getFaculty() {
  return safeFetch("/faculty", []);
}
export function getEvents() {
  return safeFetch("/events", mockEvents);
}
export function getTestimonials() {
  return safeFetch("/testimonials", mockTestimonials);
}
export function getPlacementPartners() {
  return safeFetch("/placement-partners", []);
}
// Gallery events — each event can hold multiple images + a chosen thumbnail.
export function getGalleryEvents() {
  return safeFetch("/gallery", []);
}
export function getGalleryEvent(id) {
  return safeFetch(`/gallery/${id}`, null);
}
// ---------- Research / QAA / Publications (public reads) ----------
export function getAuthorGuidelines() {
  return safeFetch("/research/author-guidelines", { content: "", files: [] });
}
export function getCallForPapers() {
  return safeFetch("/research/call-for-papers", []);
}
export function getJournals() {
  return safeFetch("/research/journals", []);
}
export function getPublications() {
  return safeFetch("/publications", []);
}
// Note: QAA documents are intentionally NOT exposed here — that list now
// requires login (server/routes/qaa.js requires requireAuth on GET too), so
// there is no public/unauthenticated read for it. See pages/Qaa.jsx, which
// shows a login gate instead of fetching anything.
export function submitContactForm(payload) {
  return safeFetch(
    "/contact",
    { ok: true, demo: true },
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

// ---------- Auth ----------
export function login(email, password) {
  return apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function fetchMe() {
  return apiCall("/auth/me");
}
export function changePassword(currentPassword, newPassword) {
  return apiCall("/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
export function inviteAdmin({ name, email, role }) {
  return apiCall("/auth/invite", {
    method: "POST",
    body: JSON.stringify({ name, email, role }),
  });
}
export function acceptInvite(token, password) {
  return apiCall("/auth/accept-invite", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
export function forgotPassword(email) {
  return apiCall("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
export function resetPassword(token, password) {
  return apiCall("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
export function listAdmins() {
  return apiCall("/auth/admins");
}
export function updateAdminRole(id, role) {
  return apiCall(`/auth/admins/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}
export function resendInvite(id) {
  return apiCall(`/auth/admins/${id}/resend-invite`, { method: "POST" });
}
export function deleteAdmin(id) {
  return apiCall(`/auth/admins/${id}`, { method: "DELETE" });
}

// ---------- Admin: Settings ----------
export function updateSettings(payload) {
  return apiCall("/settings", { method: "PUT", body: JSON.stringify(payload) });
}

// ---------- Admin: Page & Section Visibility ----------
export function getVisibilitySchema() {
  return apiCall("/settings/visibility-schema");
}
export function updateVisibility(visibility) {
  return apiCall("/settings/visibility", {
    method: "PUT",
    body: JSON.stringify({ visibility }),
  });
}

// ---------- Admin: image upload (from the admin's own device) ----------
// Returns { url, filename, size }
export function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return apiCall("/upload", { method: "POST", body: formData });
}
// Returns { files: [{ url, filename, size }] }
export function uploadImages(files) {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append("images", f));
  return apiCall("/upload/multiple", { method: "POST", body: formData });
}

// ---------- Admin: generic CRUD helper for simple resources ----------
function makeCrud(resource) {
  return {
    list: () => apiCall(`/${resource}`),
    create: (payload) =>
      apiCall(`/${resource}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      apiCall(`/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) => apiCall(`/${resource}/${id}`, { method: "DELETE" }),
  };
}

export const noticesAdmin = makeCrud("notices");
export const downloadsAdmin = makeCrud("downloads");
export const facultyAdmin = makeCrud("faculty");
export const eventsAdmin = makeCrud("events");
export const testimonialsAdmin = makeCrud("testimonials");
export const placementPartnersAdmin = makeCrud("placement-partners");
export const galleryAdmin = makeCrud("gallery");
export const callForPapersAdmin = makeCrud("research/call-for-papers");
export const journalsAdmin = makeCrud("research/journals");
export const publicationsAdmin = makeCrud("publications");

// Author Guidelines is a singleton (like Settings), not a list — its own
// pair of calls rather than the makeCrud() list helper.
export function getAuthorGuidelinesAdmin() {
  return apiCall("/research/author-guidelines");
}
export function updateAuthorGuidelines(payload) {
  return apiCall("/research/author-guidelines", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// QAA — standard CRUD for regular admins, plus a dedicated verify call that
// a qaaVerifier account is also allowed to make.
export const qaaAdmin = makeCrud("qaa");
export function verifyQaaDocument(id, status) {
  return apiCall(`/qaa/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export const coursesAdmin = {
  list: () => apiCall("/courses?all=true"),
  create: (payload) =>
    apiCall("/courses", { method: "POST", body: JSON.stringify(payload) }),
  update: (slug, payload) =>
    apiCall(`/courses/${slug}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (slug) => apiCall(`/courses/${slug}`, { method: "DELETE" }),
};

export const messagesAdmin = {
  list: () => apiCall("/contact"),
  markRead: (id) => apiCall(`/contact/${id}/read`, { method: "PATCH" }),
  remove: (id) => apiCall(`/contact/${id}`, { method: "DELETE" }),
};

// ---------- Non-credit skill courses (informational cards) ----------
export function getSkillCourses() {
  return safeFetch("/skill-courses", []);
}
export const skillCoursesAdmin = makeCrud("skill-courses");

// ---------- Live workshops (enrollable, link out to an admin-set form) ----------
export function getWorkshops() {
  return safeFetch("/workshops", []);
}
export const workshopsAdmin = {
  list: () => apiCall("/workshops?all=true"),
  create: (payload) =>
    apiCall("/workshops", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiCall(`/workshops/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiCall(`/workshops/${id}`, { method: "DELETE" }),
};

// ---------- FAQs (powers the "Chat with Admissions" instant-answer widget) ----------
export function getFaqs() {
  return safeFetch("/faqs", []);
}
export const faqsAdmin = makeCrud("faqs");

// ---------- Blog (public + admin) ----------
export function getBlogs(opts = {}) {
  const qs = opts.all ? "?all=true" : "";
  return safeFetch(`/blogs${qs}`, []);
}
export function getBlog(identifier) {
  return safeFetch(`/blogs/${identifier}`, null);
}
export const blogAdmin = {
  list: () => apiCall("/blogs?all=true"),
  create: (payload) =>
    apiCall("/blogs", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    apiCall(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => apiCall(`/blogs/${id}`, { method: "DELETE" }),
};

// ---------- Knowledge Base (PDFs the "Chat with Admissions" bot is trained on) ----------
// Returns { doc } — doc.status starts "processing", flips to "ready" once
// chunking/embedding finishes in the background (poll getKnowledgeDocs()).
export function uploadKnowledgePdf(file) {
  const formData = new FormData();
  formData.append("pdf", file);
  return apiCall("/knowledge/upload", { method: "POST", body: formData });
}
export function getKnowledgeDocs() {
  return apiCall("/knowledge");
}
export function deleteKnowledgeDoc(id) {
  return apiCall(`/knowledge/${id}`, { method: "DELETE" });
}

// ---------- Chat with Admissions — conversation history (admin dashboard) ----------
// Real-time messaging itself happens over Socket.io (see api/chatSocket.js);
// these two just power the admin's inbox list + "load past messages" views.
// ---------- Admin live-chat push notifications & availability ----------
export function getVapidPublicKey() {
  return apiCall("/admin-push/vapid-public-key");
}
export function subscribePush(subscription) {
  return apiCall("/admin-push/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription }),
  });
}
export function unsubscribePush(endpoint) {
  return apiCall("/admin-push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}
export function updateChatPreferences(payload) {
  return apiCall("/admin-push/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getConversations(status) {
  const qs = status ? `?status=${status}` : "";
  return apiCall(`/chat/conversations${qs}`);
}
export function getConversationMessages(id) {
  return apiCall(`/chat/conversations/${id}/messages`);
}
