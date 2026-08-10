import Admin from "../models/Admin.js";
import { getVapidPublicKey, pushEnabled } from "../utils/webPush.js";
import { notifyAdminPreferencesChanged } from "../sockets/chatSocket.js";

// GET /api/admin-push/vapid-public-key
export function vapidPublicKey(req, res) {
  res.json({ enabled: pushEnabled, publicKey: getVapidPublicKey() });
}

// POST /api/admin-push/subscribe  { subscription }
export async function subscribe(req, res) {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh) {
      return res.status(400).json({ message: "Invalid push subscription" });
    }

    await Admin.findByIdAndUpdate(req.admin.id, {
      $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
    });
    await Admin.findByIdAndUpdate(req.admin.id, {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
      },
    });

    res.json({ message: "Subscribed" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Couldn't save subscription", error: err.message });
  }
}

// POST /api/admin-push/unsubscribe  { endpoint }
export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: "Missing endpoint" });
    await Admin.findByIdAndUpdate(req.admin.id, {
      $pull: { pushSubscriptions: { endpoint } },
    });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Couldn't remove subscription", error: err.message });
  }
}

// PUT /api/admin-push/preferences  { available?, notificationsEnabled? }
export async function updatePreferences(req, res) {
  try {
    const update = {};
    if (typeof req.body.available === "boolean")
      update.available = req.body.available;
    if (typeof req.body.notificationsEnabled === "boolean")
      update.notificationsEnabled = req.body.notificationsEnabled;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const admin = await Admin.findByIdAndUpdate(req.admin.id, update, {
      new: true,
    }).select("-password");

    // Live-sync this change to any other tab/device this admin is
    // currently logged into (e.g. a laptop and a phone both signed in) —
    // no refresh or re-login required on the other end.
    notifyAdminPreferencesChanged(req.admin.id, update);

    res.json({ admin });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Couldn't update preferences", error: err.message });
  }
}
