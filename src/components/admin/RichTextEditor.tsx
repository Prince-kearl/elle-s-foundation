import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link, List, ListOrdered, Quote, Underline } from "lucide-react";

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "P", "BR", "UL", "OL", "LI", "BLOCKQUOTE", "A"]);
const SAFE_LINK_PROTOCOL = /^(?:https?:\/\/|mailto:|tel:)/i;

export function sanitizeRichText(value: string | null | undefined) {
  const input = String(value ?? "");
  if (typeof DOMParser === "undefined") return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  const doc = new DOMParser().parseFromString(`<div>${input}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";
  const clean = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const element = node as HTMLElement;
    const tag = element.tagName;
    const children = Array.from(element.childNodes).map(clean).join("");
    if (!ALLOWED_TAGS.has(tag)) return children;
    if (tag === "A") {
      const href = (element.getAttribute("href") ?? "").trim();
      if (!SAFE_LINK_PROTOCOL.test(href)) return children;
      const escapedHref = href.replace(/&/g, "&amp;").replace(/\"/g, "&quot;");
      return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    return `<${tag.toLowerCase()}>${children}</${tag.toLowerCase()}>`;
  };
  return Array.from(root.childNodes).map(clean).join("");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
}

export function richTextForDisplay(value: string | null | undefined) {
  const input = String(value ?? "");
  return sanitizeRichText(input.includes("<") ? input : escapeHtml(input));
}

export function RichTextEditor({ value, onChange, placeholder = "Write a quote…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const command = (name: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className={`overflow-hidden border bg-white ${focused ? "border-primary ring-1 ring-primary/20" : "border-[#D8E0DA]"}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E9EEE9] bg-[#F8FAF7] p-2" aria-label="Text formatting tools">
        <button type="button" onClick={() => command("bold")} title="Bold" aria-label="Bold" className="grid size-8 place-items-center text-primary hover:bg-secondary"><Bold className="size-4" /></button>
        <button type="button" onClick={() => command("italic")} title="Italic" aria-label="Italic" className="grid size-8 place-items-center text-primary hover:bg-secondary"><Italic className="size-4" /></button>
        <button type="button" onClick={() => command("underline")} title="Underline" aria-label="Underline" className="grid size-8 place-items-center text-primary hover:bg-secondary"><Underline className="size-4" /></button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={() => command("insertUnorderedList")} title="Bulleted list" aria-label="Bulleted list" className="grid size-8 place-items-center text-primary hover:bg-secondary"><List className="size-4" /></button>
        <button type="button" onClick={() => command("insertOrderedList")} title="Numbered list" aria-label="Numbered list" className="grid size-8 place-items-center text-primary hover:bg-secondary"><ListOrdered className="size-4" /></button>
        <button type="button" onClick={() => command("formatBlock", "blockquote")} title="Quote block" aria-label="Quote block" className="grid size-8 place-items-center text-primary hover:bg-secondary"><Quote className="size-4" /></button>
        <button type="button" onClick={() => { const url = window.prompt("Link URL"); if (url) command("createLink", url); }} title="Add link" aria-label="Add link" className="grid size-8 place-items-center text-primary hover:bg-secondary"><Link className="size-4" /></button>
      </div>
      <div ref={editorRef} contentEditable role="textbox" aria-multiline="true" data-placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onInput={(event) => onChange(event.currentTarget.innerHTML)} className="rich-text-editor rich-text min-h-36 p-4 text-sm leading-7 text-ink outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]" />
    </div>
  );
}
