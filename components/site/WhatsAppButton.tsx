import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-40 grid size-14 place-items-center rounded-full bg-[#1f9d55] text-white shadow-lift transition hover:scale-105"
    >
      <MessageCircle aria-hidden className="size-7" />
    </a>
  );
}
