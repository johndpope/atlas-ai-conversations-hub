import React, { useState, FormEvent, KeyboardEvent, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  className?: string;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  className,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
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
      className={`fixed bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-4 sm:px-6 ${
        className || ""
      }`}
    >
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 text-sm text-foreground"
            >
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <button
          type="button"
          onClick={handleFileButtonClick}
          className="absolute left-3 rounded-xl p-2 text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          type="text"
          className="flex-1 border border-input bg-background text-foreground rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-ring pr-12 h-[56px] placeholder:text-muted-foreground"
          placeholder={t("chat.inputPlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`absolute right-3 rounded-xl p-2 ${
            (message.trim() || selectedFiles.length > 0) && !isLoading
              ? "chat-gradient text-white"
              : "bg-secondary text-muted-foreground"
          }`}
          disabled={!(message.trim() || selectedFiles.length > 0) || isLoading}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground px-1">
        Pressione Enter para enviar, Shift+Enter para adicionar uma nova linha
      </div>
    </form>
  );
};
