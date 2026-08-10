import jwt from "jsonwebtoken";
import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";
import Admin from "../models/Admin.js";
import { answerStudentQuestion } from "../services/ragService.js";
import { wantsHumanAdmin } from "../services/intentService.js";
import {
  notifyAdmins,
  findNotifiableAdmins,
  findNotifiableAdminById,
} from "../utils/webPush.js";

const ADMIN_INBOX_ROOM = "admin:inbox";
const HOLDING_MESSAGE =
  "Connecting you to an admin — someone will be with you shortly.";
const NO_ADMIN_MESSAGE =
  "Our admin isn't available right now feel free to call us in office hour . Otherwise,If you have any question you can ask me.";
const EMAIL_CAPTURED_MESSAGE =
  "Got it — we'll follow up at that email soon. Feel free to keep asking me questions too.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HANDOFF_TIMEOUT_MS =
  (Number(process.env.HANDOFF_TIMEOUT_MINUTES) || 5) * 60 * 1000;

const pendingHandoffTimers = new Map();

function clearHandoffTimer(conversationId) {
  const timer = pendingHandoffTimers.get(String(conversationId));
  if (timer) {
    clearTimeout(timer);
    pendingHandoffTimers.delete(String(conversationId));
  }
}

function conversationRoom(sessionId) {
  return `conv:${sessionId}`;
}

// Set once initChatSocket() runs. REST controllers (e.g. pushController's
// updatePreferences) have no direct access to the socket.io instance, but
// still need to push live updates to an admin's OTHER open tabs/devices —
// e.g. toggling "Available" on a laptop should update a phone session
// instantly, without that phone needing to refresh or log out/in.
let sharedAdminNsp = null;

// Broadcasts a partial admin-preferences change (available and/or
// notificationsEnabled) to every socket this admin currently has open,
// on any device. Safe to call even before sockets are initialized (e.g.
// in tests) — it's a no-op until initChatSocket() has run.
export function notifyAdminPreferencesChanged(adminId, partial) {
  if (!sharedAdminNsp) return;
  sharedAdminNsp
    .to(`admin:${adminId}`)
    .emit("admin:preferences_updated", partial);
}

function anyAdminAvailable() {
  return Admin.exists({ status: "active", available: true });
}

// Fire-and-forget in-app alert (sound/badge) for a connected admin's open
// tab — the socket-side counterpart to pushNotify() below, which only
// handles the tab-closed/browser-closed case. Both are needed: push alone
// misses admins who are logged in but just not looking at Live Chat right
// now, since Socket.io delivers instantly to an open tab with zero setup,
// while push is the only way to reach a closed browser.
function alertAdmins(adminNsp, adminIds, payload) {
  for (const id of adminIds) {
    adminNsp.to(`admin:${id}`).emit("admin:alert", payload);
  }
}

// Fire-and-forget push notify — never let a push failure break the chat flow.
function pushNotify(admins, payload) {
  notifyAdmins(admins, payload).catch((err) =>
    console.error("[chatSocket] push notify failed:", err.message),
  );
}

function broadcastToConversation(io, adminNsp, sessionId, event, payload) {
  const room = conversationRoom(sessionId);
  io.to(room).emit(event, payload);
  adminNsp.to(room).emit(event, payload);
}

async function saveMessage(conversationId, sender, text, sourceChunkIds = []) {
  const message = await ChatMessage.create({
    conversationId,
    sender,
    text,
    sourceChunkIds,
  });
  await ChatConversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
    lastMessagePreview: text.slice(0, 140),
  });
  return message;
}

export function initChatSocket(io) {
  const adminNsp = io.of("/admin");
  sharedAdminNsp = adminNsp;

  adminNsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev_secret_change_me",
      );
      socket.admin = payload;
      next();
    } catch (err) {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("student:join", async ({ sessionId, studentName }) => {
      if (!sessionId) return;
      try {
        let conversation = await ChatConversation.findOne({ sessionId });
        if (!conversation) {
          conversation = await ChatConversation.create({
            sessionId,
            studentName: studentName || "",
          });
        }
        socket.join(conversationRoom(sessionId));
        socket.data.sessionId = sessionId;
        socket.data.conversationId = String(conversation._id);

        const messages = await ChatMessage.find({
          conversationId: conversation._id,
        })
          .sort({ createdAt: 1 })
          .limit(200);

        socket.emit("conversation:state", {
          status: conversation.status,
          messages,
        });
      } catch (err) {
        socket.emit("chat:error", {
          message: "Couldn't start chat. Please refresh and try again.",
        });
      }
    });

    socket.on("student:message", async ({ sessionId, text }) => {
      if (!sessionId || !text?.trim()) return;

      try {
        const conversation = await ChatConversation.findOne({ sessionId });
        if (!conversation) {
          return socket.emit("chat:error", {
            message: "Chat session not found — please refresh.",
          });
        }

        const studentMessage = await saveMessage(
          conversation._id,
          "student",
          text.trim(),
        );
        broadcastToConversation(
          io,
          adminNsp,
          sessionId,
          "chat:message",
          studentMessage,
        );
        adminNsp.to(ADMIN_INBOX_ROOM).emit("admin:conversation_updated", {
          conversationId: conversation._id,
          lastMessagePreview: studentMessage.text.slice(0, 140),
          lastMessageAt: studentMessage.createdAt,
        });

        if (
          conversation.status === "ADMIN" ||
          conversation.status === "WAITING_FOR_ADMIN"
        ) {
          // Re-notify so an admin who closed their tab still hears about
          // follow-up messages — for an assigned chat, just that admin; for
          // one still in the waiting queue, everyone with notifications on.
          if (conversation.status === "ADMIN" && conversation.assignedAdmin) {
            const admin = await findNotifiableAdminById(
              conversation.assignedAdmin,
            );
            const alertPayload = {
              conversationId: String(conversation._id),
              studentName: conversation.studentName,
              lastMessagePreview: studentMessage.text.slice(0, 140),
            };
            alertAdmins(adminNsp, [conversation.assignedAdmin], alertPayload);
            if (admin)
              pushNotify([admin], {
                title: conversation.studentName || "New message",
                body: studentMessage.text.slice(0, 120),
                conversationId: String(conversation._id),
              });
          } else if (conversation.status === "WAITING_FOR_ADMIN") {
            const admins = await findNotifiableAdmins();
            const alertPayload = {
              conversationId: String(conversation._id),
              studentName: conversation.studentName,
              lastMessagePreview: studentMessage.text.slice(0, 140),
            };
            alertAdmins(
              adminNsp,
              admins.map((a) => a._id),
              alertPayload,
            );
            pushNotify(admins, {
              title: "Student waiting for a reply",
              body: studentMessage.text.slice(0, 120),
              conversationId: String(conversation._id),
            });
          }
          return;
        }

        if (conversation.awaitingContactEmail) {
          conversation.awaitingContactEmail = false;
          const trimmed = text.trim();
          if (EMAIL_REGEX.test(trimmed)) {
            conversation.contactEmail = trimmed;
            await conversation.save();
            const confirmMsg = await saveMessage(
              conversation._id,
              "bot",
              EMAIL_CAPTURED_MESSAGE,
            );
            broadcastToConversation(
              io,
              adminNsp,
              sessionId,
              "chat:message",
              confirmMsg,
            );
            return;
          }
          await conversation.save();
        }

        if (wantsHumanAdmin(text)) {
          // If no admin has "Available" switched on, don't make the student
          // sit through the handoff timeout at all — tell them right away
          // and drop straight into the same fallback the timeout would've
          // reached anyway (offer a callback email, keep chatting with bot).
          if (!(await anyAdminAvailable())) {
            conversation.status = "BOT";
            conversation.awaitingContactEmail = true;
            await conversation.save();

            const noAdminMsg = await saveMessage(
              conversation._id,
              "bot",
              NO_ADMIN_MESSAGE,
            );
            broadcastToConversation(
              io,
              adminNsp,
              sessionId,
              "chat:message",
              noAdminMsg,
            );
            return;
          }

          conversation.status = "WAITING_FOR_ADMIN";
          await conversation.save();

          const holdingMessage = await saveMessage(
            conversation._id,
            "bot",
            HOLDING_MESSAGE,
          );
          broadcastToConversation(
            io,
            adminNsp,
            sessionId,
            "chat:message",
            holdingMessage,
          );
          broadcastToConversation(
            io,
            adminNsp,
            sessionId,
            "conversation:status",
            { status: "WAITING_FOR_ADMIN" },
          );

          adminNsp.to(ADMIN_INBOX_ROOM).emit("admin:escalation", {
            conversationId: conversation._id,
            sessionId: conversation.sessionId,
            studentName: conversation.studentName,
            lastMessagePreview: studentMessage.text.slice(0, 140),
          });

          findNotifiableAdmins().then((admins) =>
            pushNotify(admins, {
              title: "New student needs an admin",
              body: studentMessage.text.slice(0, 120),
              conversationId: String(conversation._id),
            }),
          );

          clearHandoffTimer(conversation._id);
          const timer = setTimeout(async () => {
            pendingHandoffTimers.delete(String(conversation._id));
            try {
              const fresh = await ChatConversation.findById(conversation._id);
              if (!fresh || fresh.status !== "WAITING_FOR_ADMIN") return;
              fresh.status = "BOT";
              fresh.awaitingContactEmail = true;
              await fresh.save();
              const fallbackMsg = await saveMessage(
                fresh._id,
                "bot",
                NO_ADMIN_MESSAGE,
              );
              broadcastToConversation(
                io,
                adminNsp,
                fresh.sessionId,
                "chat:message",
                fallbackMsg,
              );
              broadcastToConversation(
                io,
                adminNsp,
                fresh.sessionId,
                "conversation:status",
                { status: "BOT" },
              );
              adminNsp.to(ADMIN_INBOX_ROOM).emit("admin:conversation_updated", {
                conversationId: fresh._id,
              });
            } catch (err) {
              console.error("handoff timeout error:", err);
            }
          }, HANDOFF_TIMEOUT_MS);
          pendingHandoffTimers.set(String(conversation._id), timer);
          return;
        }

        const { answer, usedChunkIds } = await answerStudentQuestion(
          text.trim(),
        );
        const botMessage = await saveMessage(
          conversation._id,
          "bot",
          answer,
          usedChunkIds,
        );
        broadcastToConversation(
          io,
          adminNsp,
          sessionId,
          "chat:message",
          botMessage,
        );
      } catch (err) {
        console.error("student:message error:", err);
        socket.emit("chat:error", {
          message: "Something went wrong answering that — please try again.",
        });
      }
    });
  });

  adminNsp.on("connection", (socket) => {
    socket.join(ADMIN_INBOX_ROOM);
    // Personal room so a specific admin can be alerted/pushed to regardless
    // of how many tabs/devices they have open — used by alertAdmins() above.
    socket.join(`admin:${socket.admin.id}`);

    socket.on("admin:join_inbox", async () => {
      const waiting = await ChatConversation.find({
        status: "WAITING_FOR_ADMIN",
      })
        .sort({ lastMessageAt: -1 })
        .limit(50);
      const active = await ChatConversation.find({
        status: "ADMIN",
        assignedAdmin: socket.admin.id,
      }).sort({ lastMessageAt: -1 });
      socket.emit("admin:inbox_state", { waiting, active });
    });

    socket.on("admin:accept", async ({ conversationId }) => {
      try {
        const conversation = await ChatConversation.findById(conversationId);
        if (!conversation) return;

        clearHandoffTimer(conversation._id);
        conversation.status = "ADMIN";
        conversation.assignedAdmin = socket.admin.id;
        await conversation.save();

        socket.join(conversationRoom(conversation.sessionId));

        const messages = await ChatMessage.find({
          conversationId: conversation._id,
        })
          .sort({ createdAt: 1 })
          .limit(200);
        socket.emit("admin:conversation_state", { conversation, messages });

        io.to(conversationRoom(conversation.sessionId)).emit(
          "conversation:status",
          {
            status: "ADMIN",
          },
        );
        adminNsp
          .to(conversationRoom(conversation.sessionId))
          .emit("conversation:status", {
            status: "ADMIN",
          });
        adminNsp.to(ADMIN_INBOX_ROOM).emit("admin:conversation_claimed", {
          conversationId: conversation._id,
        });
      } catch (err) {
        socket.emit("chat:error", { message: "Couldn't accept this chat." });
      }
    });

    socket.on("admin:message", async ({ conversationId, text }) => {
      if (!text?.trim()) return;
      try {
        const conversation = await ChatConversation.findById(conversationId);
        if (!conversation || conversation.status !== "ADMIN") return;
        if (String(conversation.assignedAdmin) !== String(socket.admin.id))
          return;

        const message = await saveMessage(
          conversation._id,
          "admin",
          text.trim(),
        );
        broadcastToConversation(
          io,
          adminNsp,
          conversation.sessionId,
          "chat:message",
          message,
        );
      } catch (err) {
        socket.emit("chat:error", { message: "Message failed to send." });
      }
    });

    socket.on("admin:end", async ({ conversationId }) => {
      try {
        const conversation = await ChatConversation.findById(conversationId);
        if (!conversation) return;

        conversation.status = "BOT";
        conversation.assignedAdmin = undefined;
        await conversation.save();

        socket.leave(conversationRoom(conversation.sessionId));
        broadcastToConversation(
          io,
          adminNsp,
          conversation.sessionId,
          "conversation:status",
          {
            status: "BOT",
          },
        );
        adminNsp.to(ADMIN_INBOX_ROOM).emit("admin:conversation_updated", {
          conversationId: conversation._id,
        });
      } catch (err) {
        socket.emit("chat:error", { message: "Couldn't end this chat." });
      }
    });
  });
}
