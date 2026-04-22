import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

interface CaseResult {
  title: string;
  court: string;
  year: string;
  category: string;
  summary: string;
  link: string;
  relevance?: string;
}

interface Filters {
  category?: string;
  purpose?: string;
  court?: string;
  keywords?: string;
  time?: string;
}

const API_URL = "http://localhost:5000/api/cases";

const STEPS = [
  { key: "category", question: "What **type of legal case** are you researching?", hint: "e.g. Criminal, Civil, Family, Property, Labour, Tax, Constitutional", icon: "⚖️" },
  { key: "purpose",  question: "What is your **research purpose**?",               hint: "e.g. Legal advice, academic research, drafting petition, case preparation", icon: "🎯" },
  { key: "court",    question: "Which **court** should I focus on?",               hint: "e.g. Supreme Court, Delhi High Court, any High Court, District Court", icon: "🏛️" },
  { key: "keywords", question: "Any **keywords, sections, or acts** to include?",  hint: "e.g. IPC 302, Article 21, POCSO, specific party names or facts", icon: "🔍" },
  { key: "time",     question: "Any **time period** preference?",                   hint: "e.g. Last 5 years, 2010–2020, landmark cases only, recent judgments", icon: "📅" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Constitutional: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Criminal:       "bg-red-100 text-red-700 border-red-300",
  Civil:          "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Family:         "bg-pink-500/10 text-pink-300 border-pink-500/20",
  Property:       "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Labour:         "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Tax:            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Corporate:      "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  Consumer:       "bg-teal-500/10 text-teal-300 border-teal-500/20",
  Environmental:  "bg-green-500/10 text-green-300 border-green-500/20",
  "—":            "bg-slate-500/10 text-slate-700 border-slate-500/20",
};

const RELEVANCE_BADGE: Record<string, string> = {
  High:   "bg-emerald-100 text-emerald-700 border-emerald-300 border-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Low:    "bg-slate-500/15 text-slate-700 border-slate-500/25",
};

function renderBold(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<span class='font-semibold text-amber-300'>$1</span>");
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-white/8" />
        <div className="h-5 w-12 rounded-full bg-white/5" />
      </div>
      <div className="h-4 w-3/4 rounded bg-white/8 mb-2" />
      <div className="h-3 w-full rounded bg-white/5 mb-1" />
      <div className="h-3 w-5/6 rounded bg-white/5 mb-1" />
      <div className="h-3 w-2/3 rounded bg-white/5 mb-4" />
      <div className="h-3 w-24 rounded bg-amber-500/15" />
    </div>
  );
}

function CaseCard({ c, index }: { c: CaseResult; index: number }) {
  const catColor = CATEGORY_COLORS[c.category] || CATEGORY_COLORS["—"];
  const relColor = RELEVANCE_BADGE[c.relevance || "Medium"] || RELEVANCE_BADGE["Medium"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="group relative rounded-2xl border border-white/6 bg-white/3 backdrop-blur-md hover:bg-white/5 hover:border-amber-500/20 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {c.category !== "—" && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
              {c.category}
            </span>
          )}
          {c.court !== "—" && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/8 bg-white/4 text-slate-700">
              🏛 {c.court}
            </span>
          )}
          {c.year !== "—" && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/8 bg-white/4 text-slate-700">
              📅 {c.year}
            </span>
          )}
          {c.relevance && c.relevance !== "—" && (
            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${relColor}`}>
              {c.relevance} Relevance
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 leading-snug mb-2.5 line-clamp-2">
          {c.title}
        </h3>
        {c.summary && c.summary !== "—" && (
          <p className="text-sm text-slate-800 leading-relaxed font-medium line-clamp-3 mb-4">
            {c.summary}
          </p>
        )}
        {c.link && c.link !== "#" ? (
          <a
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors group/link"
          >
            <span>Read Full Judgment</span>
            <svg
              className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ) : (
          <span className="text-[11px] text-slate-600 italic">Link unavailable</span>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl mb-4">
        🔎
      </div>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">No Cases Found</h3>
      <p className="text-xs text-slate-600 max-w-[240px]">
        Try different keywords, broaden your court selection, or adjust the time range.
      </p>
    </motion.div>
  );
}

export default function Research() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: `Namaste! I'm your **Legal Research Assistant**.\n\nI'll help you find relevant Indian case laws from the Supreme Court, High Courts, and more.\n\n${STEPS[0].icon} ${STEPS[0].question}`,
    },
  ]);

  const [step, setStep]       = useState(0);
  const [input, setInput]     = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [results, setResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, results, loading]);

  useEffect(() => {
    if (!done) inputRef.current?.focus();
  }, [step, done]);

  const addMessage = useCallback((role: "user" | "ai", text: string) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    addMessage("user", text);
    setInput("");

    const updated = { ...filters, [STEPS[step].key]: text };
    setFilters(updated);

    const nextStep = step + 1;

    if (nextStep < STEPS.length) {
      setTimeout(() => {
        addMessage("ai", `${STEPS[nextStep].icon} ${STEPS[nextStep].question}\n\n*${STEPS[nextStep].hint}*`);
        setStep(nextStep);
      }, 400);
      return;
    }

    setDone(true);
    setLoading(true);
    setError(null);

    setTimeout(() => {
      addMessage(
        "ai",
        "🔍 Searching across **Indian Kanoon**, **SCC Online**, **Law Insider India** and more...\n\nThis may take a few seconds."
      );
    }, 300);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as any).error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const safe: CaseResult[] = Array.isArray(data) ? data : [data];

      setResults(
        safe.map((item: any) => ({
          title:     item.title     || "Untitled Case",
          court:     item.court     || "—",
          year:      String(item.year || "—"),
          category:  item.category  || "—",
          summary:   item.summary   || "",
          link:      item.link      || "#",
          relevance: item.relevance || "Medium",
        }))
      );

      setTimeout(() => {
        const count = safe.filter((c) => c.title !== "No cases found").length;
        addMessage(
          "ai",
          count > 0
            ? `✅ Found **${count} relevant case${count !== 1 ? "s" : ""}** matching your criteria. Scroll down to review the judgments.`
            : "⚠️ No cases matched your exact query. Try broadening your search with different keywords."
        );
      }, 500);
    } catch (err: any) {
      console.error("❌ Frontend error:", err);
      setError(err.message || "Something went wrong");
      addMessage(
        "ai",
        "❌ **Unable to fetch results** at this time.\n\nPlease check your connection or try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => window.location.reload();

  const validResults = results.filter(
    (c) => c.title !== "No cases found" && c.title !== "Error"
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        #research-root * { box-sizing: border-box; }

        #research-root ::-webkit-scrollbar { width: 4px; }
        #research-root ::-webkit-scrollbar-track { background: transparent; }
        #research-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        #research-root ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

        .chat-bubble-ai {
          background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

          border-radius: 4px 16px 16px 16px;
        }
        .chat-bubble-user {
          background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 6px 18px rgba(249,115,22,0.35);
          border-radius: 16px 4px 16px 16px;
        }
      .glass-input {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  font-weight: 500;

}
.glass-input::placeholder {
  color: #94a3b8;
}
        .glass-input:focus {
          border-color: rgba(217,119,6,0.5);
          background: rgba(255,255,255,0.06);
        }
        .glass-input::placeholder { color: rgba(148,163,184,0.4); }
      `}</style>

      <div
        id="research-root"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className="relative w-full min-h-screen flex flex-col"
      >
        {/* Ambient background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,100,20,0.10) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(30,60,120,0.07) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{ position: "relative", zIndex: 1 }}
          className="max-w-2xl mx-auto px-4 flex flex-col min-h-[calc(100vh-140px)]"
        >
          {/* ── CHAT AREA ── */}
          <div
            className="flex flex-col gap-4 py-6 flex-1"
            style={{ paddingBottom: 80 }}
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                >
                  {msg.role === "ai" && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        background: "rgba(217,119,6,0.15)",
                        border: "1px solid rgba(217,119,6,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        marginRight: 8,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    >
                      ⚖
                    </div>
                  )}
                  <div
                    className={msg.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"}
                    style={{
                      maxWidth: "82%",
                      padding: "10px 14px",
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: msg.role === "ai" ? "#0f172a" : "#ffffff",
fontWeight: 500,
                      whiteSpace: "pre-wrap",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderBold(msg.text).replace(
                        /\*(.*?)\*/g,
                        "<span style='color:#94a3b8;font-style:italic'>$1</span>"
                      ),
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Skeletons */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                <p className="text-[11px] text-slate-600 text-center mb-4 tracking-wide">
                  Searching legal databases...
                </p>
                <div className="flex flex-col gap-2.5">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Case Results */}
            {!loading && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-2"
              >
                {validResults.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] text-slate-600 tracking-widest uppercase whitespace-nowrap">
                        {validResults.length} case{validResults.length !== 1 ? "s" : ""} found
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {validResults.map((c, i) => (
                        <CaseCard key={`${c.title}-${i}`} c={c} index={i} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState />
                )}
              </motion.div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 p-4 rounded-2xl text-center"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <p className="text-xs text-red-400 mb-1">⚠️ Request Failed</p>
                <p className="text-[11px] text-slate-700">{error}</p>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── INPUT BAR ── */}
          <div
            className="sticky bottom-0 left-0 w-full z-10 pt-3 pb-5 mt-auto"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,0.95) 60%, transparent)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {!done ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  className="glass-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={STEPS[step]?.hint || "Type your answer..."}
                  style={{ flex: 1, padding: "11px 16px", borderRadius: 14, fontSize: 13 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    padding: "11px 18px",
                    borderRadius: 14,
                    background: input.trim()
                      ? "linear-gradient(135deg, #d97706, #b45309)"
                      : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: input.trim() ? "#fff" : "#64748b",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    boxShadow: input.trim() ? "0 4px 14px rgba(217,119,6,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Send
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Start New Research
              </button>
            )}

            <p
              className="text-center mt-2.5"
              style={{ fontSize: 9.5, color: "#475569", letterSpacing: "0.03em" }}
            >
              AI-assisted research · Not legal advice · Always verify with a qualified advocate
            </p>
          </div>
        </div>
      </div>
    </>
  );
}