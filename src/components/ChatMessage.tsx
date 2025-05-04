
import React from "react";
import { UserCircle } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser }) => {
  return (
    <div
      className={`flex items-start gap-4 py-4 px-6 ${
        isUser ? "bg-white" : "message-ai"
      }`}
    >
      <div className="shrink-0">
        {isUser ? (
          <UserCircle className="h-8 w-8 text-slate-500" />
        ) : (
          <div className="h-8 w-8 rounded-full chat-gradient flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-medium text-sm text-slate-700">
          {isUser ? "You" : "Atlas AI"}
        </p>
        <div className="prose prose-slate prose-sm max-w-none">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};
