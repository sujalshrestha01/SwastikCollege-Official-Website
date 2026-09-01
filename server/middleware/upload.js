import multer from "multer";
import path from "path";

// Files land in memory as a Buffer (req.file.buffer / req.files[i].buffer)
// and are streamed straight to Cloudinary from the controller — nothing is
// ever written to local disk.
const storage = multer.memoryStorage();

// Images + PDF + Word — PDFs are needed for notice attachments and the
// navbar "Download" resource; Word docs were added for the QAA / Research
// (Author Guidelines, Call for Paper, Journals, Publications) uploads,
// which the college needs to accept as .doc/.docx as well as PDF.
//svg not included because Cloudinary doesn't support it. Also to prevent Cross-Site Scripting / XSS attacks.
//
// Word mimetypes ("application/msword", ".../wordprocessingml.document")
// don't contain the substrings "doc"/"docx", so they can't be checked with
// the same simple extension-style regex used for everything else — an
// explicit allowlist is used for mimetypes instead, which is also just a
// more robust check in general.
const ALLOWED_EXTENSIONS = /jpeg|jpg|png|gif|webp|avif|pdf|heic|heif|doc|docx/;
const ALLOWED_MIMETYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

function fileFilter(req, file, cb) {
  const extOk = ALLOWED_EXTENSIONS.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeOk = ALLOWED_MIMETYPES.has(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(
    new Error(
      "Only image files (jpg, png, gif, webp, avif, heic, heif), PDFs, or Word documents (doc, docx) are allowed",
    ),
  );
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 20 }, // 8MB per file, up to 20 in one request
});
