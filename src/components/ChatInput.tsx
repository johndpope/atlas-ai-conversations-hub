import React, { useState, FormEvent, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  className?: string;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  className,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed bottom-0 left-0 right-0 border-t bg-white px-4 py-4 sm:px-6 ${
        className || ""
      }`}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12 h-[56px]"
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`absolute right-3 rounded-md p-2 ${
            message.trim() && !isLoading
              ? "chat-gradient text-white"
              : "bg-gray-200 text-gray-400"
          }`}
          disabled={!message.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500 px-1">
        Pressione Enter para enviar, Shift+Enter para adicionar uma nova linha
      </div>
    </form>
  );
};
