import React from "react";
import { UserCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
}) => {
  const renderContent = () => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: { node: any, inline: boolean, className?: string, children: React.ReactNode }) {
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
        <div className="prose prose-slate prose-sm max-w-none break-words overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
