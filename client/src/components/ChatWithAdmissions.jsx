import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  UserCog,
  RotateCcw,
} from "lucide-react";
import { getFaqs } from "../api/client";
import {
  getStudentSocket,
  getChatSessionId,
  resetChatSession,
} from "../api/chatSocket";

export default function ChatWithAdmissions({ onClose }) {
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("BOT");
  const [input, setInput] = useState("");
  // Only tracks "waiting on the BOT specifically" — never set/used while
  // chatting with an admin, so admin conversations are never locked.
  const [awaitingBotReply, setAwaitingBotReply] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const localKeyRef = useRef(0);

  useEffect(() => {
    getFaqs().then((data) => {
      setFaqs(data || []);
      setLoadingFaqs(false);
    });
  }, []);

  useEffect(() => {
    const socket = getStudentSocket();
    const sessionId = getChatSessionId();

    function handleState({ status, messages: history }) {
      setStatus(status);
      setMessages(
        (history || []).map((m) => ({
          key: m._id,
          sender: m.sender,
          text: m.text,
        })),
      );
      setConnected(true);
      // A fresh state load always means nothing is pending.
      setAwaitingBotReply(false);
    }
    function handleMessage(message) {
      setMessages((prev) => [
        ...prev,
        { key: message._id, sender: message.sender, text: message.text },
      ]);
      // Only an actual bot reply clears the "waiting on bot" lock. The
      // student's own message also echoes back through this same event
      // (server broadcasts it to the sender too) — that echo must NOT
      // clear the lock, or the typing indicator/block would vanish
      // instantly instead of lasting until the bot actually answers.
      if (message.sender === "bot") {
        setAwaitingBotReply(false);
      }
    }
    function handleStatus({ status }) {
      setStatus(status);
      // Switching away from BOT (e.g. handed off to an admin) means
      // there's no bot reply left to wait on.
      if (status !== "BOT") setAwaitingBotReply(false);
    }
    function handleError({ message }) {
      setAwaitingBotReply(false);
      setMessages((prev) => [
        ...prev,
        { key: `err-${Date.now()}`, sender: "bot", text: message },
      ]);
    }

    socket.on("connect", () => socket.emit("student:join", { sessionId }));
    socket.on("conversation:state", handleState);
    socket.on("chat:message", handleMessage);
    socket.on("conversation:status", handleStatus);
    socket.on("chat:error", handleError);

    if (socket.connected) socket.emit("student:join", { sessionId });

    return () => {
      socket.off("connect");
      socket.off("conversation:state", handleState);
      socket.off("chat:message", handleMessage);
      socket.off("conversation:status", handleStatus);
      socket.off("chat:error", handleError);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, awaitingBotReply]);

  function sendText(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Only block sending when we're mid-conversation with the BOT and
    // still waiting on its reply. Admin conversations are never locked —
    // students can send as many messages as they want while chatting
    // with a human.
    if (status === "BOT" && awaitingBotReply) return;
    setInput("");
    if (status === "BOT") setAwaitingBotReply(true);
    getStudentSocket().emit("student:message", {
      sessionId: getChatSessionId(),
      text: trimmed,
    });
  }

  function handleAsk(faq) {
    if (status === "BOT" && awaitingBotReply) return;
    localKeyRef.current += 1;
    setMessages((prev) => [
      ...prev,
      {
        key: `local-q-${localKeyRef.current}`,
        sender: "student",
        text: faq.question,
      },
      {
        key: `local-a-${localKeyRef.current}`,
        sender: "bot",
        text: faq.answer,
      },
    ]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendText(input);
  }

  function handleNewConversation() {
    if (
      !confirm(
        "Start a new conversation? Your current chat history will no longer be shown here (it's still safely on file if you need to reference it later).",
      )
    )
      return;
    const newId = resetChatSession();
    setMessages([]);
    setStatus("BOT");
    setAwaitingBotReply(false);
    getStudentSocket().emit("student:join", { sessionId: newId });
  }

  const statusLabel =
    status === "ADMIN"
      ? "Connected with an admissions officer"
      : status === "WAITING_FOR_ADMIN"
        ? "Waiting for an admissions officer…"
        : "Usually answers instantly";

  return (
    <div className="w-[92vw] max-w-sm bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 flex flex-col overflow-hidden max-h-[70vh] animate-[modalIn_0.25s_ease-out]">
      {/* Header */}
      <div className="bg-navy-800 dark:bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status === "ADMIN"
                ? "bg-teal-400 text-navy-900"
                : "bg-marigold-400 text-navy-900"
            }`}
          >
            {status === "ADMIN" ? <UserCog size={16} /> : <Bot size={16} />}
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {status === "ADMIN"
                ? "Admissions Officer"
                : "Admissions Assistant"}
            </p>
            <p className="text-[11px] text-navy-300 leading-tight">
              {statusLabel}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-navy-300 hover:text-white">
          <X size={18} />
        </button>
      </div>
      {messages.length > 0 && (
        <div className="px-4 py-1.5 border-b border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-900/60 shrink-0">
          <button
            onClick={handleNewConversation}
            className="text-[11px] font-medium text-navy-400 hover:text-navy-700 dark:hover:text-navy-100 flex items-center gap-1"
          >
            <RotateCcw size={11} /> Start a new conversation
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper dark:bg-navy-900/40">
        <div className="flex gap-2 items-start">
          <span className="w-6 h-6 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center shrink-0 mt-0.5">
            <Bot size={12} className="text-navy-500" />
          </span>
          <p className="text-sm bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-navy-700 dark:text-navy-100">
            Hi! Ask me anything about admissions, courses, or the college — or
            tap a question below. Type "chat with admin" any time to reach a
            real person.
          </p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.key}
            className={`flex gap-2 items-start ${msg.sender === "student" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.sender === "student"
                  ? "bg-marigold-400 text-navy-900"
                  : msg.sender === "admin"
                    ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                    : "bg-navy-100 dark:bg-navy-700 text-navy-500"
              }`}
            >
              {msg.sender === "student" ? (
                <User size={12} />
              ) : msg.sender === "admin" ? (
                <UserCog size={12} />
              ) : (
                <Bot size={12} />
              )}
            </span>
            <p
              className={`text-sm rounded-2xl px-3.5 py-2.5 max-w-[80%] whitespace-pre-wrap ${
                msg.sender === "student"
                  ? "bg-marigold-400 text-navy-900 rounded-tr-sm"
                  : "bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 text-navy-700 dark:text-navy-100 rounded-tl-sm"
              }`}
            >
              {msg.text}
            </p>
          </div>
        ))}

        {status === "BOT" && awaitingBotReply && (
          <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} className="text-navy-500" />
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-2xl rounded-tl-sm px-4 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-navy-300 dark:bg-navy-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-navy-300 dark:bg-navy-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-navy-300 dark:bg-navy-500 animate-bounce" />
            </div>
          </div>
        )}

        {!loadingFaqs && faqs.length > 0 && messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {faqs.map((f) => (
              <button
                key={f._id}
                onClick={() => handleAsk(f)}
                disabled={status === "BOT" && awaitingBotReply}
                className="text-xs font-medium bg-white dark:bg-navy-800 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {f.question}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 border-t border-navy-100 dark:border-navy-700 shrink-0 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            !connected
              ? "Connecting…"
              : status === "WAITING_FOR_ADMIN"
                ? "An admin will be with you shortly…"
                : status === "BOT" && awaitingBotReply
                  ? "Waiting for a reply…"
                  : "Type your question…"
          }
          disabled={!connected || (status === "BOT" && awaitingBotReply)}
          className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-full border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-800 dark:text-paper outline-none focus:border-marigold-300 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={
            !connected ||
            !input.trim() ||
            (status === "BOT" && awaitingBotReply)
          }
          aria-label="Send"
          className="w-10 h-10 shrink-0 rounded-full bg-marigold hover:bg-marigold-500 disabled:opacity-50 text-navy-900 flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
      {status === "BOT" && (
        <div className="px-3 pb-3 -mt-1 shrink-0">
          <button
            onClick={() => sendText("chat with admin")}
            disabled={!connected || awaitingBotReply}
            className="w-full text-xs font-medium text-navy-500 dark:text-navy-300 hover:text-navy-800 dark:hover:text-white transition-colors py-1"
          >
            Prefer to talk to a person? Chat with admin →
          </button>
        </div>
      )}
    </div>
  );
}
