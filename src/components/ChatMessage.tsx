
import React from "react";
import { UserCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser }) => {
  const renderContent = () => {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Adicionar texto antes do bloco de código
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </p>
        );
      }

      // Extrair linguagem e código
      const language = match[1].trim() || "text";
      const code = match[2].trim();

      // Adicionar bloco de código formatado
      parts.push(
        <div key={`code-${match.index}`} className="code-block my-2">
          {language !== "text" && (
            <div className="code-header">
              <span>{language}</span>
            </div>
          )}
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0 }}
            showLineNumbers={language !== "text"}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Adicionar texto restante
    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`}>{content.substring(lastIndex)}</p>
      );
    }

    return parts.length > 0 ? parts : <p>{content}</p>;
  };

  return (
    <div className={`flex items-start gap-4 py-4 px-6 ${isUser ? "bg-white" : "message-ai"}`}>
      <div className="shrink-0"> {isUser ? ( <UserCircle className="h-8 w-8 text-slate-500" /> ) : (
          <div className="h-8 w-8 rounded-full chat-gradient flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-medium text-sm text-slate-700">
          {isUser ? "You" : "Atlas AI"}
        </p>
        <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
