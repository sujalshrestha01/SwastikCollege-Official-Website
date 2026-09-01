import jwt from "jsonwebtoken";

// A qaaVerifier account (see server/models/Admin.js) must only ever be able
// to reach QAA endpoints (to view/verify documents) and the shared auth
// endpoints (login, /me, change-password, logout). Every other API route is
// blocked here, at one single choke point, applied globally in index.js —
// rather than relying on every individual route file remembering to check
// the role, which is exactly the kind of thing that quietly regresses later
// when someone adds a new route.
const ALLOWED_PREFIXES = ["/api/auth", "/api/qaa"];

export function restrictQaaVerifier(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  // No token (or a malformed one) — nothing to restrict here. The route's
  // own requireAuth middleware will reject the request if it needed one.
  if (!token) return next();

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me",
    );

    if (payload.role === "qaaVerifier") {
      const allowed = ALLOWED_PREFIXES.some((prefix) =>
        req.path.startsWith(prefix),
      );
      if (!allowed) {
        return res.status(403).json({
          message: "This account only has access to QAA verification.",
        });
      }
    }
  } catch {
    // Invalid/expired token — let the route's own requireAuth produce the
    // proper 401 instead of failing silently here.
  }

  next();
}
