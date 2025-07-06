import React, { useState } from "react";
import { UserCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FollowUpSuggestions } from "./FollowUpSuggestions";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  think?: string | null;
  isStreaming?: boolean;
  followUpSuggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

// Estilo aprimorado para blocos de código
const enhancedCodeStyle = {
  ...vscDarkPlus,
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    fontSize: "0.9em",
    lineHeight: "1.4",
  },
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto",
    borderRadius: "0.5rem",
    backgroundColor: "#1e1e1e",
  },
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  think,
  isStreaming,
  followUpSuggestions,
  onSuggestionClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (codeToCopy: string) => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-3 last:mb-0" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className={`underline ${
                isUser ? "text-blue-300 hover:text-blue-100" : "text-blue-600 hover:text-blue-800"
              }`}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-3 pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-3 pl-4" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`border-l-4 pl-4 italic my-3 ${
                isUser 
                  ? "border-gray-600 text-gray-300" 
                  : "border-slate-300 text-slate-600"
              }`}
              {...props}
            />
          ),
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node: any;
            inline?: boolean;
            className?: string;
            children: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeText = String(children).replace(/\n$/, "");

            // Ajuste: Tratar como inline visualmente se for detectado como bloco (inline=false)
            // mas não tiver linguagem, for linha única e curto.
            const treatAsInline =
              inline ||
              (!language &&
                !codeText.includes("\n") &&
                codeText.trim().length < 60);

            if (!treatAsInline) {
              // Renderizar como bloco de código completo
              return (
                <div className="code-block my-4 relative group bg-[#2d2d2d] rounded-md shadow-sm overflow-hidden">
                  {language && (
                    <div className="code-header flex justify-between items-center px-3 py-1 bg-gray-700 text-slate-300 rounded-t-md text-xs font-sans">
                       <span>{language}</span>
                       <button
                         onClick={() => handleCopyCode(String(children).replace(/\n$/, ""))}
                          className="text-xs text-white hover:text-gray-300 p-1 rounded"
                       >
                         {copied ? "Copiado!" : "Copiar"}
                       </button>
                     </div>
                  )}
                  <SyntaxHighlighter
                    language={language || "text"}
                    style={enhancedCodeStyle}
                    customStyle={{
                      margin: 0,
                      padding: "1em",
                      whiteSpace: "pre-wrap",
                      backgroundColor: "transparent", // Fundo já está no div pai
                      borderRadius: language ? "0" : "0.5rem", // Arredonda se não houver header
                      fontSize: "0.875rem", // Ajuste fino do tamanho da fonte
                      lineHeight: "1.5", // Ajuste fino da altura da linha
                    }}
                    showLineNumbers={!!language && codeText.includes("\n")} // Mostrar números só se tiver linguagem E múltiplas linhas
                    wrapLines={true}
                    lineNumberStyle={{
                      color: "#6a6a6a",
                      fontSize: "0.75em",
                      marginRight: "1em",
                      userSelect: "none",
                    }}
                    {...props}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              // Renderizar como código inline (mesmo que a sintaxe original fosse ```)
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-[0.9em] font-mono mx-0.5 align-baseline ${
                    isUser
                      ? "bg-gray-700 text-gray-100"
                      : "bg-slate-200 text-slate-800"
                  }`}
                  {...props}
                >
                  {/* Usar codeText aqui para remover a quebra de linha final, se houver */}
                  {codeText}
                </code>
              );
            }
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={`py-5 px-4 sm:px-6 border-b border-slate-100 ${
        isUser ? "bg-white" : "bg-slate-50"
      }`}
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[70%] bg-gray-800 text-white rounded-2xl px-4 py-3 rounded-br-md">
            <div className="prose prose-slate prose-sm max-w-none break-words text-start text-white leading-relaxed">
              {renderContent()}
              {isStreaming && (
                <span className="inline-block w-1 h-4 ml-1 bg-blue-600 animate-pulse rounded-full" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="shrink-0 pt-1">
            <div className="h-7 w-7 rounded-full chat-gradient flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-xs">AI</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p
              className="font-semibold text-sm tracking-wide"
              style={{ color: "#2D3748" }}
            >
              Atlas AI
            </p>
            {think && (
              <div className="bg-slate-100 rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1 font-medium">
                  Pensando...
                </p>
                <div className="prose prose-slate prose-sm max-w-none break-words overflow-hidden text-slate-600">
                  {think}
                </div>
              </div>
            )}
            <div className="prose prose-slate prose-sm max-w-none break-words text-start text-slate-800 leading-relaxed">
              {renderContent()}
              {isStreaming && (
                <span className="inline-block w-1 h-4 ml-1 bg-blue-600 animate-pulse rounded-full" />
              )}
            </div>
            {!isStreaming && followUpSuggestions && onSuggestionClick && (
              <FollowUpSuggestions
                suggestions={followUpSuggestions}
                onSuggestionClick={onSuggestionClick}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

