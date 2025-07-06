import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChatInput } from "./ChatInput";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { WelcomeMessage } from "./WelcomeMessage";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Api } from "../database/db";
import { apiKeyGroq, geminiKey, huggfaceKey } from "../../variables.json";
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from "react-i18next";
// Removed problematic import - using inline implementation instead

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  think?: string | null;
  isStreaming?: boolean;
  followUpSuggestions?: string[];
}

interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
}

const AI_MODELS: AIModel[] = [
  { id: "compound", name: "Compound Beta", maxTokens: 8192 },
  { id: "llama", name: "Llama 3.3 70B Versatile", maxTokens: 32768 },
  { id: "deepseek", name: "Deepseek R1 Distill 70B", maxTokens: 131072 },
  { id: "maverick", name: "Llama 4 Maverick 17B", maxTokens: 8192 },
  { id: "gemma", name: "Gemma 2 9B", maxTokens: 8192 },
  { id: "gemini", name: "Gemini 2.0 Flash", maxTokens: 8192 },
  { id: "deepseekr1", name: "DeepSeek R1", maxTokens: 131072 },
  { id: "deepseekv3", name: "DeepSeek V3", maxTokens: 131072 },
  { id: "qwen32b", name: "Qwen Master 32b", maxTokens: 131072 },
  { id: "grok", name: "Grok AI", maxTokens: 32768 },
  { id: "grok-mock", name: "Grok AI (Mock)", maxTokens: 32768 },
];

// Helper function to process think tags and content
const processThinkTags = (text: string) => {
  let currentContent = text;
  let currentThink = null;

  const fullThinkTagRegex = /<think>(.*?)<\/think>/s;
  const openThinkTagRegex = /<think>(.*)/s;

  const fullThinkMatch = text.match(fullThinkTagRegex);
  const openThinkMatch = text.match(openThinkTagRegex);

  if (fullThinkMatch) {
    currentThink = fullThinkMatch[1].trim();
    currentContent = text.replace(fullThinkTagRegex, "");
  } else if (openThinkMatch) {
    currentThink = openThinkMatch[1].trim();
    currentContent = text.replace(openThinkTagRegex, "");
  }

  currentContent = currentContent.replace(/\*\*/g, "*").trim();

  return { content: currentContent, think: currentThink };
};

export const ChatContainer: React.FC = () => {
  const { t } = useTranslation();
  // Simple browser-compatible Mock Grok API client
  class SimpleMockGrokAPI {
    private mockBaseUrl: string;

    constructor(mockBaseUrl: string = 'http://localhost:3001') {
      this.mockBaseUrl = mockBaseUrl;
    }

    async sendMessageStream(
      options: { message: string; customInstructions?: string; fileAttachments?: any[] },
      callbacks: {
        onToken?: (token: string) => void;
        onComplete?: (response: { fullMessage: string; followUpSuggestions?: string[] }) => void;
        onError?: (error: any) => void;
      }
    ): Promise<void> {
      try {
        const response = await fetch(`${this.mockBaseUrl}/rest/app-chat/conversations/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: options.message,
            fileAttachments: options.fileAttachments || [],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullMessage = '';
        let followUpSuggestions: string[] = [];

        if (!reader) {
          throw new Error('No response body reader available');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() && line !== '[DONE]') {
              try {
                const parsed = JSON.parse(line);
                // Handle mock server response format: {"result":{"response":{"token":"..."}}}
                if (parsed.result?.response?.token) {
                  const token = parsed.result.response.token;
                  fullMessage += token;
                  callbacks.onToken?.(token);
                } else if (parsed.result?.response?.finalMetadata) {
                  // Capture follow-up suggestions from finalMetadata
                  followUpSuggestions = parsed.result.response.finalMetadata.followUpSuggestions || [];
                  // End of stream - call onComplete with suggestions
                  callbacks.onComplete?.({ fullMessage, followUpSuggestions });
                  return;
                }
              } catch (e) {
                // Skip invalid JSON or check for [DONE] marker
                if (line.trim() === '[DONE]') {
                  callbacks.onComplete?.({ fullMessage, followUpSuggestions });
                  return;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in streaming message to mock Grok API:', error);
        callbacks.onError?.(error);
        throw error;
      }
    }
  }

  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(
    window.location.search.includes('mock=true') || 
    import.meta.env.VITE_MOCK_MODE === 'true' || 
    import.meta.env.MODE === 'mock' ? 
    "grok-mock" : "qwen32b"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    let resposta = "";
    const messageId = Date.now().toString();

    const userMessage = {
      id: messageId,
      content,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    try {
      const context =
        "Your name is Atlas, a large language model that can answer any question. You are also a helpful assistant. You are also a code assistant.";

      const historico = await Api.recuperarMemoria("user");

      const messages = [{ content: context, role: "system" }];

      historico.forEach(({ mensagem, resposta }) => {
        messages.push({ content: mensagem, role: "user" });
        messages.push({ content: resposta, role: "assistant" });
      });

      messages.push({ role: "user", content: content });

      const modelUrl = "/openai/v1/chat/completions";
      const headers = {
        Authorization: "Bearer " + apiKeyGroq,
        "Content-Type": "application/json",
      };

      const aiMessageId = (Date.now() + 1).toString();
      const initialMessage = {
        id: aiMessageId,
        content: "",
        isUser: false,
        think: null,
        isStreaming: true,
      };

      // yo're a warrior keep it harder

      switch (selectedModel) {
        case "gemini": {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          setMessages((prevMessages) => [...prevMessages, initialMessage]);
          setIsLoading(false);

          const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: content,
          });

          for await (const chunk of response) {
            if (chunk.text) {
              resposta += chunk.text;
              const processed = processThinkTags(resposta);

              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: processed.content,
                        think: processed.think,
                        isStreaming: false,
                      }
                    : msg
                )
              );
            }
          }
          break;
        }

        case "grok": {
          setMessages((prevMessages) => [...prevMessages, initialMessage]);
          setIsLoading(false);

          // Build message history for Grok
          const grokMessages = messages.map((msg) => ({
            message: msg.content,
            role: msg.role as "user" | "assistant" | "system",
          }));

          try {
            // Send streaming message to Grok API server
            const response = await fetch('/grok-api/stream', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: content,
                customInstructions: context,
                messageHistory: grokMessages,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("Failed to get response reader");

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') break;

                  try {
                    const parsed = JSON.parse(data);
                    
                    if (parsed.type === 'token') {
                      resposta += parsed.token;
                      const processed = processThinkTags(resposta);

                      setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                          msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: processed.content,
                                think: processed.think,
                                isStreaming: true,
                              }
                            : msg
                        )
                      );
                    } else if (parsed.type === 'complete') {
                      const processed = processThinkTags(parsed.fullMessage);
                      setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                          msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: processed.content,
                                think: processed.think,
                                isStreaming: false,
                              }
                            : msg
                        )
                      );
                    } else if (parsed.type === 'error') {
                      throw new Error(parsed.error);
                    }
                  } catch (e) {
                    console.error("Error parsing Grok SSE:", e);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Grok streaming error:", error);
            toast({
              title: t("errors.grokError"),
              description: t("errors.grokDescription"),
              variant: "destructive",
            });
          }
          break;
        }

        case "grok-mock": {
          // Initialize Mock Grok API (no authentication needed)
          const mockGrokApi = new SimpleMockGrokAPI("http://localhost:3001");
          setMessages((prevMessages) => [...prevMessages, initialMessage]);
          setIsLoading(false);

          // Handle file uploads first if any
          let fileAttachments: any[] = [];
          if (files && files.length > 0) {
            try {
              const uploadPromises = files.map(async (file) => {
                // Convert file to base64 for the mock server
                const fileData = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                });
                
                const response = await fetch('http://localhost:3001/rest/app-chat/upload-file', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    fileName: file.name,
                    fileMimeType: file.type,
                    content: fileData
                  }),
                });
                
                if (!response.ok) {
                  throw new Error(`Upload failed: ${response.status}`);
                }
                
                const fileMetadata = await response.json();
                return fileMetadata;
              });
              
              fileAttachments = await Promise.all(uploadPromises);
            } catch (error) {
              console.error('File upload error:', error);
              toast({
                title: t("errors.uploadError"),
                description: t("errors.uploadDescription"),
                variant: "destructive",
              });
            }
          }

          // Send streaming message to Mock Grok
          await mockGrokApi.sendMessageStream(
            {
              message: content,
              customInstructions: context,
              fileAttachments: fileAttachments,
            },
            {
              onToken: (token: string) => {
                resposta += token;
                const processed = processThinkTags(resposta);

                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: processed.content,
                          think: processed.think,
                          isStreaming: true,
                        }
                      : msg
                  )
                );
              },
              onComplete: (response) => {
                const processed = processThinkTags(response.fullMessage);
                
                // Ensure followUpSuggestions are strings, not objects
                const followUpSuggestions = (response.followUpSuggestions || []).map((suggestion: any) => {
                  if (typeof suggestion === 'string') {
                    return suggestion;
                  }
                  // If it's an object, try to extract a meaningful string
                  return suggestion.label || suggestion.properties || JSON.stringify(suggestion);
                });
                
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: processed.content,
                          think: processed.think,
                          isStreaming: false,
                          followUpSuggestions: followUpSuggestions,
                        }
                      : msg
                  )
                );
              },
              onError: (error) => {
                console.error("Mock Grok streaming error:", error);
                toast({
                  title: t("errors.mockGrokError"),
                  description: t("errors.mockGrokDescription"),
                  variant: "destructive",
                });
              },
            }
          );
          break;
        }

        default: {
          const modelMapping = {
            compound: "compound-beta",
            llama: "llama-3.3-70b-versatile",
            deepseek: "deepseek-r1-distill-llama-70b",
            maverick: "meta-llama/llama-4-maverick-17b-128e-instruct",
            gemma: "gemma2-9b-it",
            deepseekv3: "accounts/fireworks/models/deepseek-v3",
            deepseekr1: "deepseek-ai/DeepSeek-R1",
            qwen32b: "Qwen/QwQ-32B",
          };

          const selectedAiModel =
            modelMapping[selectedModel as keyof typeof modelMapping];
          const maxTokens =
            AI_MODELS.find((model) => model.id === selectedModel)?.maxTokens ||
            8192;

          let url = modelUrl;
          let requestHeaders = headers;

          if (selectedModel === "deepseekv3") {
            url = "/fireworks-ai/inference/v1/chat/completions";
            requestHeaders = {
              "Content-Type": "application/json",
              Authorization: "Bearer " + huggfaceKey,
            };
          } else if (selectedModel === "deepseekr1") {
            url = "/hyperbolic/v1/chat/completions";
            requestHeaders = {
              "Content-Type": "application/json",
              Authorization: "Bearer " + huggfaceKey,
            };
          }else if (selectedModel === "qwen32b") {
            url = "/hyperbolic/v1/chat/completions";
            requestHeaders = {
              "Content-Type": "application/json",
              Authorization: "Bearer " + huggfaceKey,
            };
          }

          const data = {
            model: selectedAiModel,
            messages: messages,
            temperature: 0.1,
            max_completion_tokens: maxTokens,
            top_p: 1,
            stop: null,
            stream: true,
          };

          setMessages((prevMessages) => [...prevMessages, initialMessage]);
          setIsLoading(false);

          const response = await fetch(url, {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify(data),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error("Failed to get response reader");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    resposta += parsed.choices[0].delta.content;
                    const processed = processThinkTags(resposta);

                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: processed.content,
                              think: processed.think,
                              isStreaming: false,
                            }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  console.error("Error parsing SSE:", e);
                }
              }
            }
          }
        }
      }

      await Api.salvarMemoria("user", content, resposta);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: t("errors.title"),
        description: t("errors.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-50 ${isMobile ? "pt-32" : ""}`}
    >
      <ChatHeader
        className={isMobile ? "fixed top-0 left-0 right-0 z-10 bg-white" : ""}
      />
      <div
        className={`bg-white p-4 shadow-sm ${
          isMobile ? "fixed top-16 left-0 right-0 z-10" : ""
        }`}
      >
        <Select onValueChange={setSelectedModel} value={selectedModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("chat.selectModel")} />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {t(`models.${model.id}`) || model.name} ({t("chat.maxTokens", { count: model.maxTokens })})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="divide-y">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                think={message.think}
                isStreaming={message.isStreaming}
                followUpSuggestions={message.followUpSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            {isLoading && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
            <div className="pb-[200px]" />
          </div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};