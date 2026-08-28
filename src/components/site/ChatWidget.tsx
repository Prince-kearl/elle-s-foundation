import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";

type ChatMessage = { id: number; from: "assistant" | "user"; text: string };

type QuickAction = {
  label: string;
  prompt: string;
  answer: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Our programs",
    prompt: "Which programs should I explore?",
    answer: "You can explore our community support programmes across education, health, shelter, and community development. Visit the Programs page to see the current focus areas and ways to get involved.",
  },
  {
    label: "Support us",
    prompt: "How can I support Elle's Foundation?",
    answer: "You can support the work through a donation, sponsorship, volunteering, or a community partnership. Visit Support us to choose the option that fits you best.",
  },
  {
    label: "Volunteer",
    prompt: "How can I volunteer?",
    answer: "We would love to hear from you. Use the Contact page to tell us how you would like to contribute, and our team will follow up with the next steps.",
  },
  {
    label: "Contact team",
    prompt: "How can I contact the team?",
    answer: "You can send a message through our Contact page. Include what you are interested in and the team will get back to you.",
  },
];

const WELCOME: ChatMessage = {
  id: 1,
  from: "assistant",
  text: "Welcome to Elle's Foundation. I can help you find programmes, learn about ways to support the work, or connect with our team.",
};

function answerFor(text: string) {
  const normalized = text.toLowerCase();
  const quick = QUICK_ACTIONS.find((action) => normalized.includes(action.label.toLowerCase().split(" ")[0]));
  if (quick) return quick.answer;
  if (/donat|sponsor|give|support/.test(normalized)) return QUICK_ACTIONS[1].answer;
  if (/program|programme|education|health|shelter/.test(normalized)) return QUICK_ACTIONS[0].answer;
  if (/volunteer|join/.test(normalized)) return QUICK_ACTIONS[2].answer;
  if (/contact|email|reach/.test(normalized)) return QUICK_ACTIONS[3].answer;
  return "I can help with programmes, donations, sponsorships, volunteering, and contacting the team. Choose a quick question above or send me a message about one of those topics.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), from: "user", text: trimmed },
      { id: Date.now() + 1, from: "assistant", text: answerFor(trimmed) },
    ]);
    setInput("");
  };

  const clearConversation = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  return (
    <div className="chat-widget-root pointer-events-none" style={{ fontFamily: "var(--font-sans)" }}>
      {open ? (
        <section
          aria-label="Elle's Foundation chat assistant"
          className="pointer-events-auto w-full max-w-[380px] overflow-hidden border shadow-2xl sm:w-[380px]"
          style={{
            background: "var(--background)",
            borderColor: "color-mix(in srgb, var(--primary) 22%, var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 24px 60px color-mix(in srgb, var(--ink) 18%, transparent)",
          }}
        >
          <header className="relative overflow-hidden px-4 pb-3 pt-4" style={{ background: "var(--primary)", color: "var(--primary-foreground, #fff)" }}>
            <div className="pointer-events-none absolute -right-10 -top-14 size-36 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-3 -top-7 size-24 rounded-full border border-white/15" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">Foundation assistant</p>
                  <h2 className="mt-0.5 truncate font-display text-lg font-semibold">How can I guide you?</h2>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat assistant" className="grid size-8 shrink-0 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60">
                <X className="size-4" />
              </button>
            </div>
            <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  className="shrink-0 border bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                  style={{ borderColor: "color-mix(in srgb, var(--cream) 68%, transparent)" }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </header>

          <div className="max-h-[min(48vh,360px)] min-h-[220px] space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[88%] border px-3 py-2.5 text-sm leading-6"
                  style={{
                    background: message.from === "user" ? "var(--sand)" : "var(--card, var(--background))",
                    borderColor: message.from === "user" ? "color-mix(in srgb, var(--primary) 20%, var(--border))" : "var(--border)",
                    color: message.from === "user" ? "var(--ink)" : "var(--foreground, var(--ink))",
                    borderRadius: "calc(var(--radius) * 0.7)",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t p-3" style={{ borderColor: "var(--border)", background: "var(--cream)" }}>
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Ask about the foundation</span>
              <button type="button" onClick={clearConversation} className="font-semibold hover:text-primary focus:outline-none focus:underline">Clear</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <label className="sr-only" htmlFor="foundation-chat-input">Ask a question</label>
              <input id="foundation-chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question..." className="min-w-0 flex-1 border bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" style={{ borderColor: "var(--border)", borderRadius: "calc(var(--radius) * 0.6)" }} />
              <button type="submit" aria-label="Send message" disabled={!input.trim()} className="grid size-10 shrink-0 place-items-center text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95" style={{ background: "var(--earth)", borderRadius: "calc(var(--radius) * 0.6)" }}>
                <Send className="size-4" />
              </button>
            </form>
          </footer>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Elle's Foundation chat assistant"
          className="pointer-events-auto grid size-16 place-items-center rounded-full border-4 shadow-xl transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95"
          style={{ background: "var(--earth)", borderColor: "var(--background)", color: "var(--primary-foreground, #fff)", boxShadow: "0 12px 28px color-mix(in srgb, var(--ink) 22%, transparent)" }}
        >
          <MessageCircle className="size-7" />
        </button>
      )}
    </div>
  );
}
