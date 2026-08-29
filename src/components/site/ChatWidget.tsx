import { useLocation } from "@tanstack/react-router";
import { Bot, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";

type ChatMessage = { id: number; from: "assistant" | "user"; text: string };

type QuickAction = {
  label: string;
  prompt: string;
  answer: string;
};

type PageChatContext = {
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  greeting: string;
  greetingTitle: string;
  greetingBody: string;
  inputPlaceholder: string;
  quickActions: QuickAction[];
};

const PAGE_CONTEXTS: Array<{ matches: (pathname: string) => boolean; context: PageChatContext }> = [
  {
    matches: (pathname) => pathname === "/",
    context: {
      key: "home",
      eyebrow: "Welcome to Elle's Foundation",
      title: "How can I guide you?",
      subtitle: "Find a practical way to make a difference.",
      greeting: "Hello from Elle's Foundation",
      greetingTitle: "How can we help today?",
      greetingBody: "Explore our programmes, discover ways to support the work, or connect with the team.",
      inputPlaceholder: "Ask about the foundation...",
      quickActions: [
        { label: "Our programs", prompt: "Which programs should I explore?", answer: "You can explore our community support programmes across education, health, shelter, and community development. Visit the Programs page to see the current focus areas and ways to get involved." },
        { label: "Support us", prompt: "How can I support Elle's Foundation?", answer: "You can support the work through a donation, sponsorship, volunteering, or a community partnership. Visit Support us to choose the option that fits you best." },
        { label: "Volunteer", prompt: "How can I volunteer?", answer: "We would love to hear from you. Use the Contact page to tell us how you would like to contribute, and our team will follow up with the next steps." },
        { label: "Contact team", prompt: "How can I contact the team?", answer: "You can send a message through our Contact page. Include what you are interested in and the team will get back to you." },
      ],
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/about"),
    context: {
      key: "about",
      eyebrow: "Our story",
      title: "Discover the work behind the change.",
      subtitle: "Learn about our people, values, and long-term commitment.",
      greeting: "Discover our story",
      greetingTitle: "Curious about the foundation?",
      greetingBody: "Learn how Elle's Foundation walks alongside families and communities with dignity and practical support.",
      inputPlaceholder: "Ask about our story...",
      quickActions: [
        { label: "Our story", prompt: "Tell me about Elle's Foundation's story.", answer: "Elle's Foundation is a community-focused nonprofit dedicated to education, health, and community development. We work alongside families with humility, integrity, and a long-term commitment to real change." },
        { label: "Our impact", prompt: "What impact does the foundation have?", answer: "Our work supports children, families, volunteers, and communities through practical programmes designed to restore dignity and open opportunities for growth." },
        { label: "Join the work", prompt: "How can I join the work?", answer: "You can join through volunteering, donating, sponsoring a programme, or starting a community partnership. The Contact and Support us pages are the best places to begin." },
        { label: "Contact team", prompt: "How can I contact the team?", answer: "You can send a message through our Contact page. Tell us what you would like to learn about and the team will follow up." },
      ],
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/programs"),
    context: {
      key: "programs",
      eyebrow: "Our programmes",
      title: "Find the right way to help.",
      subtitle: "Explore practical support across education, health, and community development.",
      greeting: "Explore our programmes",
      greetingTitle: "Looking for the right programme?",
      greetingBody: "I can help you understand our focus areas and find a meaningful way to get involved.",
      inputPlaceholder: "Ask about a programme...",
      quickActions: [
        { label: "Education", prompt: "Tell me about the education programme.", answer: "Our education work helps children access learning, scholarships, and brighter future opportunities." },
        { label: "Health", prompt: "Tell me about the health programme.", answer: "Our health work promotes wellbeing through clinics, checkups, clean water, and practical community support." },
        { label: "Support a program", prompt: "How can I support a programme?", answer: "You can support a programme through a donation, sponsorship, volunteering, or a partnership. Visit Support us to choose your preferred route." },
        { label: "Volunteer", prompt: "How can I volunteer in a programme?", answer: "Use the Contact page to tell us your interests, skills, and availability. Our team will follow up with suitable next steps." },
      ],
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/sponsor"),
    context: {
      key: "sponsor",
      eyebrow: "Partnerships",
      title: "Build lasting impact with us.",
      subtitle: "Explore sponsorship and partnership opportunities.",
      greeting: "Partner with Elle's Foundation",
      greetingTitle: "Interested in sponsoring the work?",
      greetingBody: "Discover how a sponsorship can help strengthen a programme and create lasting community impact.",
      inputPlaceholder: "Ask about sponsorship...",
      quickActions: [
        { label: "Sponsor a program", prompt: "How can I sponsor a programme?", answer: "You can sponsor a programme by choosing an area of interest and sharing your goals with the team through the sponsorship page or Contact page." },
        { label: "Sponsorship tiers", prompt: "What sponsorship options are available?", answer: "Our sponsorship options are designed for different levels of contribution and programme involvement. Visit the sponsorship page to review the current tiers." },
        { label: "Payment questions", prompt: "How do sponsorship payments work?", answer: "The sponsorship page explains the available payment route and captures your details so the team can confirm the next steps with you." },
        { label: "Contact team", prompt: "How can I contact the partnerships team?", answer: "Send a message through the Contact page with your organisation, area of interest, and preferred way to connect." },
      ],
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/donate"),
    context: {
      key: "donate",
      eyebrow: "Support the work",
      title: "Your support can open a door.",
      subtitle: "Choose a direct and meaningful way to contribute.",
      greeting: "Thank you for supporting the work",
      greetingTitle: "Ready to make a difference?",
      greetingBody: "I can help you understand the giving options and what your support makes possible.",
      inputPlaceholder: "Ask about giving...",
      quickActions: [
        { label: "Make a donation", prompt: "How can I make a donation?", answer: "You can make a donation through the Support us page. Choose an amount, add your contact details, and follow the available payment steps." },
        { label: "Where funds go", prompt: "Where does my donation go?", answer: "Donations help fund practical work across education, health, shelter, meals, clean water, and community development." },
        { label: "Other ways to give", prompt: "What other ways can I support?", answer: "You can also sponsor a programme, volunteer, partner with the foundation, or share the work with your community." },
        { label: "Contact team", prompt: "I have a donation question.", answer: "Send your question through the Contact page and our team will help clarify the best way to support the work." },
      ],
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/contact"),
    context: {
      key: "contact",
      eyebrow: "Connect with us",
      title: "Let's start a conversation.",
      subtitle: "Reach the team with a question, idea, or offer of support.",
      greeting: "We're here to help",
      greetingTitle: "Need to reach the team?",
      greetingBody: "Send a message, ask about volunteering, or tell us how you would like to support the foundation.",
      inputPlaceholder: "Ask how to reach us...",
      quickActions: [
        { label: "Send a message", prompt: "How can I send a message?", answer: "Use the contact form on this page and include your name, email, and what you would like to discuss. The team will follow up." },
        { label: "Volunteer", prompt: "I want to volunteer.", answer: "Tell us about your interests, skills, and availability through the contact form, and we will share suitable next steps." },
        { label: "Support us", prompt: "How can I support the foundation?", answer: "You can donate, sponsor a programme, volunteer, or start a partnership. Visit Support us to explore the options." },
        { label: "Our programs", prompt: "Where can I find the programmes?", answer: "Visit the Programs page to explore education, health, shelter, and community development initiatives." },
      ],
    },
  },
];

const DEFAULT_CONTEXT = PAGE_CONTEXTS[0].context;

function getPageChatContext(pathname: string) {
  return PAGE_CONTEXTS.find(({ matches }) => matches(pathname))?.context ?? DEFAULT_CONTEXT;
}

function welcomeMessageFor(context: PageChatContext): ChatMessage {
  return { id: 1, from: "assistant", text: `${context.greeting}. ${context.greetingBody}` };
}

function answerFor(text: string, actions: QuickAction[]) {
  const normalized = text.toLowerCase();
  const matchedAction = actions.find((action) => {
    const words = action.label.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
    return normalized.includes(action.prompt.toLowerCase()) || words.some((word) => normalized.includes(word));
  });
  if (matchedAction) return matchedAction.answer;
  if (/donat|give|support/.test(normalized)) return "You can support the work through a donation, sponsorship, volunteering, or a community partnership. Visit Support us to choose the option that fits you best.";
  if (/program|programme|education|health|shelter/.test(normalized)) return "You can explore our community support programmes across education, health, shelter, and community development on the Programs page.";
  if (/volunteer|join/.test(normalized)) return "We would love to hear from you. Use the Contact page to tell us how you would like to contribute, and our team will follow up with the next steps.";
  if (/contact|email|reach/.test(normalized)) return "You can send a message through the Contact page. Include what you are interested in and the team will get back to you.";
  return "I can help you find the right programme, understand ways to support Elle's Foundation, volunteer, or contact the team. Choose a quick reply or send me a question.";
}

export function ChatWidget() {
  const { pathname } = useLocation();
  const pageContext = getPageChatContext(pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessageFor(pageContext)]);
  const [hasNotification, setHasNotification] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingExpanded, setGreetingExpanded] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);

  useEffect(() => {
    setMessages([welcomeMessageFor(pageContext)]);
    setShowGreeting(false);
    setGreetingExpanded(false);
    setGreetingDismissed(false);
    setHasNotification(true);
  }, [pathname, pageContext]);

  useEffect(() => {
    if (open || greetingDismissed) return;
    const timer = window.setTimeout(() => setShowGreeting(true), 2500);
    return () => window.clearTimeout(timer);
  }, [open, greetingDismissed]);

  const playChatChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      gain.connect(context.destination);
      [660, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
        oscillator.connect(gain);
        oscillator.start(now + index * 0.08);
        oscillator.stop(now + 0.34);
      });
      window.setTimeout(() => void context.close(), 500);
    } catch {
      // Audio is an enhancement only; browsers may block or omit Web Audio support.
    }
  };

  const openChat = (withSound = true) => {
    setOpen(true);
    setShowGreeting(false);
    setGreetingDismissed(true);
    setHasNotification(false);
    if (withSound) playChatChime();
  };

  const expandGreeting = () => {
    setGreetingExpanded(true);
    setHasNotification(false);
  };

  const dismissGreeting = () => {
    setShowGreeting(false);
    setGreetingDismissed(true);
    setHasNotification(false);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), from: "user", text: trimmed },
      { id: Date.now() + 1, from: "assistant", text: answerFor(trimmed, pageContext.quickActions) },
    ]);
    playChatChime();
    setInput("");
  };

  const clearConversation = () => {
    setMessages([welcomeMessageFor(pageContext)]);
    setInput("");
  };

  return (
    <div className="chat-widget-root pointer-events-none" style={{ fontFamily: "var(--font-sans)" }}>
      {!open && showGreeting && !greetingDismissed && (
        <aside className={`chat-widget-greeting pointer-events-auto ${greetingExpanded ? "chat-widget-greeting-expanded" : ""}`} aria-label={`${pageContext.eyebrow} chat welcome`}>
          {greetingExpanded ? (
            <div className="chat-widget-greeting-content">
              <div className="flex items-start gap-2.5">
                <span className="chat-widget-greeting-icon grid size-9 shrink-0 place-items-center rounded-full">
                  <Bot className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{pageContext.eyebrow}</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{pageContext.greetingTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{pageContext.greetingBody}</p>
                </div>
                <button type="button" onClick={dismissGreeting} aria-label="Dismiss welcome greeting" className="chat-widget-greeting-close grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground">
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="chat-widget-greeting-chips" aria-label="Quick replies">
                {pageContext.quickActions.slice(0, 3).map((action) => (
                  <button key={action.label} type="button" onClick={() => { openChat(false); sendMessage(action.prompt); }} className="chat-widget-greeting-chip">
                    {action.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => openChat()} className="chat-widget-greeting-action mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground">
                Open chat <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={expandGreeting} aria-expanded={greetingExpanded} className="chat-widget-greeting-trigger min-w-0 flex-1 text-left">
                <span className="block truncate text-[10px] font-bold uppercase tracking-[0.13em] text-primary">{pageContext.greeting}</span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">{pageContext.greetingTitle}</span>
              </button>
              <button type="button" onClick={dismissGreeting} aria-label="Dismiss welcome greeting" className="chat-widget-greeting-close grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground">
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </aside>
      )}

      {open ? (
        <section
          id="foundation-chat-panel"
          aria-label={`${pageContext.eyebrow} chat assistant`}
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
                    {pageContext.eyebrow}
                  </div>
                  <h2 className="mt-1 truncate font-display text-[1.15rem] font-semibold leading-tight">{pageContext.title}</h2>
                  <p className="mt-1 text-xs text-white/65">{pageContext.subtitle}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => setSoundEnabled((enabled) => !enabled)} aria-label={soundEnabled ? "Mute chat sounds" : "Enable chat sounds"} aria-pressed={soundEnabled} className="chat-widget-icon-button grid size-9 shrink-0 place-items-center rounded-full border border-white/25 text-white">
                  {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat assistant" className="chat-widget-icon-button grid size-9 shrink-0 place-items-center rounded-full border border-white/25 text-white">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative mt-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                <span>Quick questions</span>
                <span className="text-white/40">Tap to ask</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {pageContext.quickActions.map((action) => (
                  <button key={action.label} type="button" onClick={() => sendMessage(action.prompt)} className="chat-widget-quick-action min-w-0 border border-white/25 bg-white/10 px-2.5 py-2 text-left text-[11px] font-semibold leading-tight text-white">
                    <span className="block truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="chat-widget-messages max-h-[min(46vh,360px)] min-h-[230px] space-y-3 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] border px-3.5 py-3 text-sm leading-6 ${message.from === "user" ? "chat-widget-user-message" : "chat-widget-assistant-message"}`} style={{ background: message.from === "user" ? "var(--sand)" : "var(--card, var(--background))", borderColor: message.from === "user" ? "color-mix(in srgb, var(--primary) 22%, var(--border))" : "var(--border)", color: message.from === "user" ? "var(--ink)" : "var(--foreground, var(--ink))" }}>
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
              <span>Ask about {pageContext.key === "home" ? "the foundation" : `our ${pageContext.key} page`}</span>
              <button type="button" onClick={clearConversation} className="chat-widget-clear-button shrink-0 font-semibold text-primary hover:text-earth">Clear chat</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <label className="sr-only" htmlFor="foundation-chat-input">Ask a question</label>
              <input id="foundation-chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder={pageContext.inputPlaceholder} className="min-w-0 flex-1 border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" style={{ borderColor: "var(--border)", borderRadius: "0.75rem" }} />
              <button type="submit" aria-label="Send message" disabled={!input.trim()} className="chat-widget-send-button grid size-10 shrink-0 place-items-center text-primary-foreground" style={{ background: "var(--earth)" }}><Send className="size-4" /></button>
            </form>
          </footer>
        </section>
      ) : (
        <button type="button" onClick={() => openChat()} aria-label="Open Elle's Foundation chat assistant" aria-controls="foundation-chat-panel" aria-expanded={open} className="chat-widget-launcher pointer-events-auto relative grid size-16 place-items-center rounded-full border-4 shadow-xl" style={{ background: "linear-gradient(135deg, var(--earth), color-mix(in srgb, var(--gold) 72%, var(--earth)))", borderColor: "var(--background)", color: "var(--primary-foreground, #fff)", boxShadow: "0 14px 32px color-mix(in srgb, var(--ink) 24%, transparent)" }}>
          <span className="chat-widget-launcher-icon grid size-10 place-items-center rounded-full border border-white/30 bg-white/15"><Bot className="size-6" strokeWidth={1.8} aria-hidden="true" /></span>
          {hasNotification && <span className="chat-widget-launcher-badge" aria-label="New chat assistant notification">1</span>}
          <span className="sr-only">Open chat</span>
        </button>
      )}
    </div>
  );
}
