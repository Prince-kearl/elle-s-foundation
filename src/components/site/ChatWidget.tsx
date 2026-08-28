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
          id="foundation-chat-panel"
          aria-label="Elle's Foundation chat assistant"
          className="chat-widget-panel pointer-events-auto w-full max-w-[390px] overflow-hidden border sm:w-[390px]"
          style={{
            background: "var(--background)",
            borderColor: "color-mix(in srgb, var(--primary) 22%, var(--border))",
            borderRadius: "1.25rem",
            boxShadow: "0 28px 80px color-mix(in srgb, var(--ink) 24%, transparent)",
          }}
        >
          <header
            className="relative overflow-hidden px-4 pb-4 pt-4 sm:px-5"
            style={{
              background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--forest) 84%, var(--primary)))",
              color: "var(--primary-foreground, #fff)",
            }}
          >
            <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -right-2 -top-8 size-28 rounded-full border border-white/15" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/15 shadow-inner">
                  <Sparkles className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    <span className="size-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_0_3px_rgba(255,255,255,0.1)]" />
                    Foundation assistant
                  </div>
                  <h2 className="mt-1 truncate font-display text-[1.15rem] font-semibold leading-tight">How can I guide you?</h2>
                  <p className="mt-1 text-xs text-white/65">Helpful answers about our work and ways to help.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat assistant"
                className="chat-widget-icon-button grid size-9 shrink-0 place-items-center rounded-full border border-white/25 text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative mt-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                <span>Quick questions</span>
                <span className="text-white/40">Tap to ask</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    className="chat-widget-quick-action min-w-0 border border-white/25 bg-white/10 px-2.5 py-2 text-left text-[11px] font-semibold leading-tight text-white"
                  >
                    <span className="block truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="chat-widget-messages max-h-[min(46vh,360px)] min-h-[230px] space-y-3 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] border px-3.5 py-3 text-sm leading-6 ${message.from === "user" ? "chat-widget-user-message" : "chat-widget-assistant-message"}`}
                  style={{
                    background: message.from === "user" ? "var(--sand)" : "var(--card, var(--background))",
                    borderColor: message.from === "user" ? "color-mix(in srgb, var(--primary) 22%, var(--border))" : "var(--border)",
                    color: message.from === "user" ? "var(--ink)" : "var(--foreground, var(--ink))",
                  }}
                >
                  {message.from === "assistant" && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--earth)]">
                      <Sparkles className="size-3" aria-hidden="true" /> Elle's assistant
                    </div>
                  )}
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t p-3.5 sm:p-4" style={{ borderColor: "var(--border)", background: "var(--cream)" }}>
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <span>Ask about the foundation</span>
              <button type="button" onClick={clearConversation} className="chat-widget-clear-button shrink-0 font-semibold text-primary hover:text-earth">
                Clear chat
              </button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <label className="sr-only" htmlFor="foundation-chat-input">Ask a question</label>
              <input
                id="foundation-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                className="min-w-0 flex-1 border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                style={{ borderColor: "var(--border)", borderRadius: "0.75rem" }}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim()}
                className="chat-widget-send-button grid size-10 shrink-0 place-items-center text-primary-foreground"
                style={{ background: "var(--earth)" }}
              >
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
          aria-controls="foundation-chat-panel"
          aria-expanded={open}
          className="chat-widget-launcher pointer-events-auto grid size-16 place-items-center rounded-full border-4 shadow-xl"
          style={{
            background: "linear-gradient(135deg, var(--earth), color-mix(in srgb, var(--gold) 72%, var(--earth)))",
            borderColor: "var(--background)",
            color: "var(--primary-foreground, #fff)",
            boxShadow: "0 14px 32px color-mix(in srgb, var(--ink) 24%, transparent)",
          }}
        >
          <MessageCircle className="size-7" />
          <span className="sr-only">Open chat</span>
        </button>
      )}
    </div>
  );
}
