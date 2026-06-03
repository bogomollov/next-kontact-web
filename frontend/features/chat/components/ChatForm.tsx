"use client";
import { apiFetch } from "@/lib/apiFetch";
import { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

export default function ChatForm({ chat_id }: { chat_id: number }) {
  const [message, setMessage] = useState<string>("");
  const [pending, isPending] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [position, setPosition] = useState<number | null>(null);
  const emojiMenu = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const emojimenu = emojiMenu.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    if (textarea && position !== null) {
      textarea.selectionStart = position;
      textarea.selectionEnd = position;
      setPosition(null);
    }
    if (textarea && emojimenu) {
      emojimenu.style.bottom = `${80 + textarea.scrollHeight}px`;
    }
  }, [message, showEmojiPicker]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || pending) return;
    setShowEmojiPicker(false);
    isPending(true);

    const res = await apiFetch(`/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ chat_id: chat_id, content: message }),
    });

    if (res.ok) {
      setMessage("");
      isPending(false);
    }
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentCursorPosition = textarea.selectionStart;
      setPosition(currentCursorPosition + emojiObject.emoji.length);
      const newMessage =
        message.slice(0, currentCursorPosition) +
        emojiObject.emoji +
        message.slice(currentCursorPosition);
      setMessage(newMessage);
      textarea.focus();
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="relative px-[20px]">
      {showEmojiPicker && (
        <div
          ref={emojiMenu}
          className="absolute left-5 z-10 rounded-md bg-white"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}
      <div className="flex w-full flex-col items-start gap-[5px] rounded-[10px] border border-neutral-300 px-[15px] py-[11px]">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full flex-col gap-4"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            minLength={1}
            maxLength={3500}
            className="resize-none outline-0"
            placeholder="Сообщение"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={pending}
            contentEditable
            style={{ overflowY: "hidden" }}
          />
          <div className="inline-flex justify-between">
            <div className="inline-flex gap-[15px]">
              <svg
                onClick={toggleEmojiPicker}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
              >
                <path
                  d="M6.4 11.8C6.4 11.8 7.75 13.6 10 13.6C12.25 13.6 13.6 11.8 13.6 11.8M12.7 7.3H12.709M7.3 7.3H7.309M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10ZM13.15 7.3C13.15 7.54853 12.9485 7.75 12.7 7.75C12.4515 7.75 12.25 7.54853 12.25 7.3C12.25 7.05147 12.4515 6.85 12.7 6.85C12.9485 6.85 13.15 7.05147 13.15 7.3ZM7.75 7.3C7.75 7.54853 7.54853 7.75 7.3 7.75C7.05147 7.75 6.85 7.54853 6.85 7.3C6.85 7.05147 7.05147 6.85 7.3 6.85C7.54853 6.85 7.75 7.05147 7.75 7.3Z"
                  stroke="#737373"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <button
              type="submit"
              className="disabled:**:stroke-neutral-200"
              disabled={pending}
            >
              <svg
                width="21"
                height="19"
                viewBox="0 0 21 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.21844 9.43253H3.71844M3.63379 9.72403L1.29887 16.6987C1.11543 17.2467 1.02372 17.5206 1.08954 17.6894C1.1467 17.8359 1.26946 17.947 1.42094 17.9892C1.59538 18.0379 1.85884 17.9193 2.38578 17.6822L19.0972 10.1621C19.6116 9.93062 19.8687 9.8149 19.9482 9.65414C20.0173 9.51447 20.0173 9.35059 19.9482 9.21093C19.8687 9.05016 19.6116 8.93444 19.0972 8.703L2.37995 1.18025C1.85461 0.94385 1.59194 0.825648 1.41767 0.874136C1.26633 0.916246 1.14358 1.02703 1.08623 1.17327C1.02018 1.34167 1.11092 1.61505 1.29239 2.1618L3.63444 9.21806C3.66561 9.31197 3.68119 9.35892 3.68734 9.40694C3.6928 9.44955 3.69275 9.49269 3.68718 9.53529C3.6809 9.58329 3.6652 9.63021 3.63379 9.72403Z"
                  stroke="#737373"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
