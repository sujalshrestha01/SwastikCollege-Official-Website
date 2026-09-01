import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import { sendInviteEmail, sendPasswordResetEmail } from "../utils/mailer.js";

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" },
  );
}

// Single allowlist of admin fields ever sent to the client, shared by
// every endpoint that returns an admin object (login, /me, preference
// updates, etc). This is what previously caused the "toggles show off
// until I refresh" bug: /login hand-picked its own field list and simply
// forgot to include `available`/`notificationsEnabled`, so right after
// login those came back as `undefined` (rendered as OFF) even though the
// DB had the correct values — only a later /me refetch (page reload)
// picked them up. Routing every response through one function makes that
// class of bug structurally impossible going forward, and is also safer
// than a "select everything except password" blocklist approach, since
// a newly added sensitive field is excluded by default instead of
// accidentally leaking until someone remembers to deselect it.
function serializeAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    available: admin.available,
    notificationsEnabled: admin.notificationsEnabled,
  };
}

function requireSuperadmin(req, res) {
  if (req.admin.role !== "superadmin") {
    res.status(403).json({ message: "Only a superadmin can do this" });
    return false;
  }
  return true;
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin)
      return res.status(401).json({ message: "Invalid email or password" });

    if (admin.status === "pending" || !admin.password) {
      return res
        .status(401)
        .json({ message: "Invite not yet accepted. Check your invite link." });
    }

    const valid = await admin.comparePassword(password);
    if (!valid)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(admin);
    res.json({ token, admin: serializeAdmin(admin) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  res.json({ admin: serializeAdmin(admin) });
}

// PUT /api/auth/password — any logged-in admin changes their own password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await admin.comparePassword(currentPassword);
    if (!valid)
      return res.status(401).json({ message: "Current password is incorrect" });

    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update password", error: err.message });
  }
}

// POST /api/auth/invite — superadmin invites a new admin/editor, real email sent
export async function inviteAdmin(req, res) {
  try {
    if (!requireSuperadmin(req, res)) return;

    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An admin with this email already exists" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const validRoles = ["superadmin", "editor", "qaaVerifier"];
    const invited = await Admin.create({
      name,
      email: normalizedEmail,
      role: validRoles.includes(role) ? role : "editor",
      status: "pending",
      inviteToken,
      inviteTokenExpires,
    });

    const inviteLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/admin/accept-invite?token=${inviteToken}`;

    const emailResult = await sendInviteEmail({
      to: normalizedEmail,
      name,
      role: invited.role,
      inviteLink,
    });

    res.status(201).json({
      message: emailResult.sent
        ? "Invite sent by email"
        : "Invite created, but the email could not be sent (see inviteLink below)",
      admin: {
        id: invited._id,
        name: invited.name,
        email: invited.email,
        role: invited.role,
        status: invited.status,
      },
      emailSent: emailResult.sent,
      // Only exposed when email delivery isn't set up (or fails) so you can
      // still test/complete the flow locally without SMTP configured. Once
      // SMTP is set up in .env, real invites go out by email and this is
      // omitted from the response.
      ...(emailResult.sent
        ? {}
        : { inviteLink, emailError: emailResult.reason }),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create invite", error: err.message });
  }
}

// POST /api/auth/accept-invite — single-use: the token is cleared the moment
// it's accepted, so the same link can never be reused after that, and it also
// stops working on its own after 48 hours even if never used.
export async function acceptInvite(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const admin = await Admin.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: new Date() },
    }).select("+inviteToken +inviteTokenExpires");

    if (!admin) {
      return res.status(400).json({
        message: "Invite link is invalid, already used, or has expired",
      });
    }

    admin.password = password; // hashed automatically by the pre('save') hook
    admin.status = "active";
    admin.inviteToken = undefined;
    admin.inviteTokenExpires = undefined;
    await admin.save();

    const token2 = signToken(admin);
    res.json({
      message: "Account activated",
      token: token2,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to accept invite", error: err.message });
  }
}

// POST /api/auth/forgot-password — always returns the same generic message
// whether or not the email exists, so this endpoint can't be used to check
// which emails are registered admins ("account enumeration").
export async function forgotPassword(req, res) {
  const genericResponse = {
    message: "If an account exists for that email, a reset link has been sent.",
  };
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
      status: "active",
    });

    if (admin) {
      const resetPasswordToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      admin.resetPasswordToken = resetPasswordToken;
      admin.resetPasswordExpires = resetPasswordExpires;
      await admin.save();

      const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/admin/reset-password?token=${resetPasswordToken}`;
      await sendPasswordResetEmail({
        to: admin.email,
        name: admin.name,
        resetLink,
      });
    }
    // Deliberately identical response either way — see comment above.
    res.json(genericResponse);
  } catch (err) {
    // Even on an unexpected error, don't leak anything different to the client.
    res.json(genericResponse);
  }
}

// POST /api/auth/reset-password — single-use: the token is cleared the
// moment it's used, and it also expires after 1 hour on its own.
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!admin) {
      return res.status(400).json({
        message: "Reset link is invalid, already used, or has expired",
      });
    }

    admin.password = password; // hashed automatically by the pre('save') hook
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    const token2 = signToken(admin);
    res.json({
      message: "Password reset successfully",
      token: token2,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to reset password", error: err.message });
  }
}

// GET /api/auth/admins — superadmin-only list of every admin/editor account
export async function listAdmins(req, res) {
  try {
    if (!requireSuperadmin(req, res)) return;
    const admins = await Admin.find()
      .sort({ createdAt: 1 })
      .select("-password");
    res.json(admins);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch admins", error: err.message });
  }
}

// PUT /api/auth/admins/:id/role — superadmin changes someone else's role
export async function updateAdminRole(req, res) {
  try {
    if (!requireSuperadmin(req, res)) return;

    const { role } = req.body;
    if (!["superadmin", "editor", "qaaVerifier"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be superadmin, editor, or qaaVerifier" });
    }
    if (req.params.id === req.admin.id) {
      return res
        .status(400)
        .json({ message: "You can't change your own role" });
    }

    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.role === "superadmin" && role !== "superadmin") {
      const superadminCount = await Admin.countDocuments({
        role: "superadmin",
      });
      if (superadminCount <= 1) {
        return res
          .status(400)
          .json({ message: "At least one superadmin must remain" });
      }
    }

    target.role = role;
    await target.save();
    res.json({
      message: "Role updated",
      admin: {
        id: target._id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update role", error: err.message });
  }
}

// POST /api/auth/admins/:id/resend-invite — regenerates a fresh 48-hour token
export async function resendInvite(req, res) {
  try {
    if (!requireSuperadmin(req, res)) return;

    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This admin has already accepted their invite" });
    }

    target.inviteToken = crypto.randomBytes(32).toString("hex");
    target.inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await target.save();

    const inviteLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/admin/accept-invite?token=${target.inviteToken}`;
    const emailResult = await sendInviteEmail({
      to: target.email,
      name: target.name,
      role: target.role,
      inviteLink,
    });

    res.json({
      message: emailResult.sent
        ? "Invite re-sent by email"
        : "Invite refreshed, but the email could not be sent (see inviteLink below)",
      emailSent: emailResult.sent,
      ...(emailResult.sent
        ? {}
        : { inviteLink, emailError: emailResult.reason }),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to resend invite", error: err.message });
  }
}

// DELETE /api/auth/admins/:id — superadmin revokes an admin/editor's access
export async function deleteAdmin(req, res) {
  try {
    if (!requireSuperadmin(req, res)) return;

    if (req.params.id === req.admin.id) {
      return res
        .status(400)
        .json({ message: "You can't remove your own account" });
    }

    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Admin not found" });

    if (target.role === "superadmin") {
      const superadminCount = await Admin.countDocuments({
        role: "superadmin",
      });
      if (superadminCount <= 1) {
        return res
          .status(400)
          .json({ message: "At least one superadmin must remain" });
      }
    }

    await target.deleteOne();
    res.json({ message: "Admin removed" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to remove admin", error: err.message });
  }
}
