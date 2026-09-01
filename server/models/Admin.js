import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Not required at creation time — an invited admin has no password
    // until they accept the invite and set one.
    password: { type: String, required: false },
    // "qaaVerifier" is a deliberately narrow role: an externally-issued
    // login (superadmin-created only) that can view QAA documents and mark
    // them verified, and nothing else — see server/middleware/restrictQaaVerifier.js
    // for the server-side enforcement of that boundary.
    role: {
      type: String,
      enum: ["superadmin", "editor", "qaaVerifier"],
      default: "editor",
    },
    status: { type: String, enum: ["pending", "active"], default: "active" },
    inviteToken: { type: String, select: false },
    inviteTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Per-admin live-chat handoff controls (see server/sockets/chatSocket.js).
    // available=false -> a student asking for a human is told immediately
    // that no one is available, instead of waiting out the handoff timeout.
    available: { type: Boolean, default: true },
    // notificationsEnabled=true -> this admin receives a push notification
    // (via the browser Push API) when a student needs attention, even if
    // their browser/tab is closed.
    notificationsEnabled: { type: Boolean, default: true },
    // Web Push subscriptions for this admin's browser(s). An admin can be
    // logged in on more than one device, so this is an array — each entry
    // is the PushSubscription object the browser hands back on subscribe.
    pushSubscriptions: {
      type: [
        {
          endpoint: { type: String, required: true },
          keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
          },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true },
);

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Admin", adminSchema);
