"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Leaf } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type GuestInfo = { name: string; email: string };

const GUEST_KEY = "idmap_chat_guest";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [guestForm, setGuestForm] = useState({ name: "", email: "" });
  const [guestError, setGuestError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load guest info from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_KEY);
      if (stored) {
        const parsed: GuestInfo = JSON.parse(stored);
        if (parsed.name && parsed.email) {
          setGuest(parsed);
          setMessages([{
            id: "1", role: "assistant",
            content: `Halo, ${parsed.name}! Selamat datang kembali di ID-MAP. Ada yang bisa saya bantu seputar program mangrove atau ekosistem pesisir?`,
            timestamp: new Date(),
          }]);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && guest) inputRef.current?.focus();
    if (isOpen && !guest) setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [isOpen, guest]);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError("");
    const name = guestForm.name.trim();
    const email = guestForm.email.trim().toLowerCase();
    if (!name || name.length < 3) {
      setGuestError("Nama lengkap minimal 3 karakter.");
      return;
    }
    if (!isValidEmail(email)) {
      setGuestError("Format email tidak valid. Contoh: nama@email.com");
      return;
    }
    const info: GuestInfo = { name, email };
    localStorage.setItem(GUEST_KEY, JSON.stringify(info));
    setGuest(info);
    setMessages([{
      id: "1", role: "assistant",
      content: `Halo, ${name}! Selamat datang di ID-MAP. Saya siap membantu Anda seputar program mangrove, integrasi data ekosistem pesisir, dan dampak kegiatan terhadap masyarakat. Ada yang bisa saya bantu?`,
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    const botId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Gagal menghubungi server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, content: m.content + delta } : m
                )
              );
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: "Maaf, terjadi kesalahan. Silakan coba lagi." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-700 shadow-[0_14px_32px_-10px_rgba(0,0,0,0.25)] ring-1 ring-gray-200 transition-transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          aria-label="Buka Live Chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-lime-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between bg-[#0f3d2e] p-4 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="font-semibold text-sm">ID-MAP Assistant</h3>
                <p className="flex items-center gap-1 text-xs text-white/70">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-800" />
                  Powered by NVIDIA NIM
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Tutup Live Chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Pre-chat form — wajib isi nama & email sebelum chat */}
          {!guest && (
            <div className="flex-1 flex flex-col justify-center p-5 bg-gray-50">
              <div className="text-center mb-5">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Leaf size={22} />
                </div>
                <p className="text-sm font-semibold text-gray-800">Sebelum memulai chat</p>
                <p className="text-xs text-gray-500 mt-1">Masukkan nama dan email Anda agar kami bisa melayani lebih baik.</p>
              </div>
              <form onSubmit={handleGuestSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Nama Lengkap</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                {guestError && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{guestError}</p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Mulai Chat
                </button>
              </form>
            </div>
          )}

          {/* Messages */}
          {guest && (
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[78%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                  }`}
                >
                  {msg.content === "" && msg.role === "assistant" ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                  {msg.content !== "" && (
                    <p className={`mt-1 text-right text-[10px] ${msg.role === "user" ? "text-white/55" : "text-gray-400"}`}>
                      {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="ml-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Input — hanya tampil setelah guest terisi */}
          {guest && <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pesan Anda..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 rounded-full bg-white p-2 text-emerald-700 border border-gray-200 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </button>
          </form>}
        </div>
      )}
    </>
  );
}
