
import React, { useState, FormEvent, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white px-4 py-4 sm:px-6"
    >
      <div className="relative flex items-center">
        <textarea
          className="flex-1 resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12 h-[56px] max-h-32 overflow-y-auto"
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className={`absolute right-3 rounded-md p-2 ${
            message && !isLoading
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
