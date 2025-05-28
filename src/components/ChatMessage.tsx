import React from "react";
import { UserCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  think?: string | null;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  think,
  isStreaming,
}) => {
  const renderContent = () => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node: any;
            inline: boolean;
            className?: string;
            children: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            return !inline ? (
              <div className="code-block my-2">
                {language && (
                  <div className="code-header">
                    <span>{language}</span>
                  </div>
                )}
                <SyntaxHighlighter
                  language={language || "text"}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0 }}
                  showLineNumbers={!!language}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={`flex items-start gap-4 py-4 px-3 sm:px-6 ${
        isUser ? "bg-white" : "message-ai"
      }`}
    >
      <div className="shrink-0">
        {" "}
        {isUser ? (
          <UserCircle className="h-8 w-8 text-slate-500" />
        ) : (
          <div className="h-8 w-8 rounded-full chat-gradient flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="font-medium text-sm text-slate-700">
          {isUser ? "You" : "Atlas AI"}
        </p>
        {!isUser && think && (
          <div className="bg-slate-100 rounded-lg p-3 mb-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Thinking...</p>
            <div className="prose prose-slate prose-sm max-w-none break-words overflow-hidden text-slate-600">
              {think}
            </div>
          </div>
        )}
        <div className="prose prose-slate prose-sm max-w-none break-words overflow-hidden relative">
          {renderContent()}
          {isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
