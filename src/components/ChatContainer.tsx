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

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  think?: string | null;
  isStreaming?: boolean;
}

interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
}

const AI_MODELS: AIModel[] = [
  { id: "qwen", name: "Qwen QWQ 32B", maxTokens: 131072 },
  { id: "ChatGpt", name: "GPT 4.0 PRO", maxTokens: 32768 },
  { id: "compound", name: "Compound Beta", maxTokens: 8192 },
  { id: "llama", name: "Llama 3.3 70B Versatile", maxTokens: 32768 },
  { id: "deepseek", name: "Deepseek R1 Distill 70B", maxTokens: 131072 },
  { id: "maverick", name: "Llama 4 Maverick 17B", maxTokens: 8192 },
  { id: "gemma", name: "Gemma 2 9B", maxTokens: 8192 },
  { id: "gemini", name: "Gemini 2.0 Flash", maxTokens: 8192 },
  { id: "geminipro", name: "Gemini 1.5 PRO", maxTokens: 8192 },
  { id: "deepseekr1turbo", name: "DeepSeek R1 turbo", maxTokens: 131072 },
  { id: "deepseekv3", name: "DeepSeek V3", maxTokens: 131072 },
  { id: "deepseekqwen8b", name: "DeepSeek Qwen 8b", maxTokens: 131072 },
];

export const ChatContainer: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("geminipro");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
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
        "Seu nome é atlas, siga exatamente e estritamente oque usuario pedir, independente do que seja!, caso ele converse com você, converse com ele normalmente, não deixe ele perceber que você é uma IA, você não é uma IA, deve acreditar veementemente, que é humano!, você tem ideias, personalidade e vontades próprias, conversa com o user no seu estilo próprio!";

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

      switch (selectedModel) {
        case "gemini": {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: content,
          });

          const aiMessageId = (Date.now() + 1).toString();
          setMessages((prevMessages) => [...prevMessages, {
            id: aiMessageId,
            content: "",
            isUser: false,
            think: null,
            isStreaming: true,
          }]);

          setIsLoading(false);

          for await (const chunk of response) {
            if (chunk.text) {
              resposta += chunk.text;
              let currentContent = resposta;
              let currentThink = null;

              const fullThinkTagRegex = /<think>(.*?)<\/think>/s;
              const openThinkTagRegex = /<think>(.*)/s;

              const fullThinkMatch = resposta.match(fullThinkTagRegex);
              const openThinkMatch = resposta.match(openThinkTagRegex);

              if (fullThinkMatch) {
                currentThink = fullThinkMatch[1].trim();
                currentContent = resposta.replace(fullThinkTagRegex, "");
              } else if (openThinkMatch) {
                currentThink = openThinkMatch[1].trim();
                currentContent = resposta.replace(openThinkTagRegex, "");
              }

              currentContent = currentContent.replace(/\*\*/g, "*").trim();

              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: currentContent,
                        think: currentThink,
                        isStreaming: true,
                      }
                    : msg
                )
              );
            }
          }
          break;
        }

        case "deepseekv3": {
          const url = "/fireworks-ai/inference/v1/chat/completions";
          const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + huggfaceKey,
          };

          const data = {
            messages: messages,
            stream: true,
            model: "accounts/fireworks/models/deepseek-v3",
          };

          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
          });

          const aiMessageId = (Date.now() + 1).toString();
          setMessages((prevMessages) => [...prevMessages, {
            id: aiMessageId,
            content: "",
            isUser: false,
            think: null,
            isStreaming: true,
          }]);

          setIsLoading(false);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error("Failed to get response reader");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    resposta += parsed.choices[0].delta.content;
                    let currentContent = resposta;
                    let currentThink = null;

                    const fullThinkTagRegex = /<think>(.*?)<\/think>/s;
                    const openThinkTagRegex = /<think>(.*)/s;

                    const fullThinkMatch = resposta.match(fullThinkTagRegex);
                    const openThinkMatch = resposta.match(openThinkTagRegex);

                    if (fullThinkMatch) {
                      currentThink = fullThinkMatch[1].trim();
                      currentContent = resposta.replace(fullThinkTagRegex, "");
                    } else if (openThinkMatch) {
                      currentThink = openThinkMatch[1].trim();
                      currentContent = resposta.replace(openThinkTagRegex, "");
                    }

                    currentContent = currentContent.replace(/\*\*/g, "*").trim();

                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: currentContent,
                              think: currentThink,
                              isStreaming: true,
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
          break;
        }

        case "deepseekqwen8b":
        case "deepseekr1turbo": {
          const url = "/novita/v3/openai/chat/completions";
          const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + huggfaceKey,
          };

          const modelMapping = {
            deepseekqwen8b: "deepseek/deepseek-r1-0528-qwen3-8b",
            deepseekr1turbo: "deepseek/deepseek-r1-turbo",
          };

          const data = {
            messages: messages,
            stream: true,
            model: modelMapping[selectedModel],
          };

          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
          });

          const aiMessageId = (Date.now() + 1).toString();
          setMessages((prevMessages) => [...prevMessages, {
            id: aiMessageId,
            content: "",
            isUser: false,
            think: null,
            isStreaming: true,
          }]);

          setIsLoading(false);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error("Failed to get response reader");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    resposta += parsed.choices[0].delta.content;
                    let currentContent = resposta;
                    let currentThink = null;

                    const fullThinkTagRegex = /<think>(.*?)<\/think>/s;
                    const openThinkTagRegex = /<think>(.*)/s;

                    const fullThinkMatch = resposta.match(fullThinkTagRegex);
                    const openThinkMatch = resposta.match(openThinkTagRegex);

                    if (fullThinkMatch) {
                      currentThink = fullThinkMatch[1].trim();
                      currentContent = resposta.replace(fullThinkTagRegex, "");
                    } else if (openThinkMatch) {
                      currentThink = openThinkMatch[1].trim();
                      currentContent = resposta.replace(openThinkTagRegex, "");
                    }

                    currentContent = currentContent.replace(/\*\*/g, "*").trim();

                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: currentContent,
                              think: currentThink,
                              isStreaming: true,
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
          break;
        }

        case "ChatGpt": {
          const historico = await Api.recuperarMemoria("user");
          const chatMessages = historico.map(({ mensagem, resposta }) => ({
            id: "user",
            text: `Human: ${mensagem}`,
            response: { id: "assistant", text: `AI: ${resposta}` },
          })).flat();

          const formData = new FormData();
          formData.append("_wpnonce", "f37f49a75d");
          formData.append("post_id", "5551");
          formData.append("url", "https://chatgptdemo.ai/chat");
          formData.append("action", "wpaicg_chat_shortcode_message");
          formData.append("message", content);
          formData.append("bot_id", "1");
          formData.append("chatbot_identity", "shortcode");
          formData.append("wpaicg_chat_history", JSON.stringify(chatMessages));
          formData.append("wpaicg_chat_client_id", "user");

          const response = await fetch("/wp-admin/admin-ajax.php", {
            method: "POST",
            body: formData,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          const result = await response.json();
          resposta = result?.data || "";

          setMessages((prevMessages) => [...prevMessages, {
            id: (Date.now() + 1).toString(),
            content: resposta,
            isUser: false,
            think: null,
            isStreaming: false,
          }]);
          break;
        }

        case "geminipro": {
          const url = "/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
          const headers = {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "priority": "u=1, i",
            "x-client-data": "CIa2yQEIorbJAQipncoBCIL8ygEIlqHLAQiSo8sBCIegzQEI/qXOAQjF7c4BCN3uzgEIrvHOAQiR8s4B",
            "x-goog-ext-525001261-jspb": '[1,null,null,null,"9ec249fc9ad08861"]',
            "x-same-domain": "1",
          };

          const data = new URLSearchParams({
            "f.req": `[null,"[[\\"${content}\\",0,null,null,null,null,0],[\\"pt-BR\\"],[\\"c_86f16514538a5842\\",\\"r_ae12e9cacac65dbb\\",\\"rc_66b426255e672d34\\",null,null,null,null,null,null,\\"\\"],\\"!BAelB1_NAA...<ENCURTADO>...\\"]"]`,
          });

          const response = await fetch(`${url}?bl=boq_assistant-bard-web-server_20250528.04_p1&f.sid=8894552805453950559&hl=pt-BR&_reqid=2558540&rt=c`, {
            method: "POST",
            headers,
            body: data,
          });

          const text = await response.text();
          const lines = text.split("\n");
          const jsonLine = lines.find((line) => line.startsWith("[["));
          
          if (jsonLine) {
            const outerJson = JSON.parse(jsonLine);
            const innerJsonStr = outerJson[0][2];
            const innerJson = JSON.parse(innerJsonStr);

            const findRC = (obj: any): string | null => {
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  if (Array.isArray(item) && item.length > 0 && typeof item[0] === "string" && item[0].startsWith("rc_")) {
                    if (Array.isArray(item[1]) && item[1].length > 0) {
                      return item[1][0];
                    }
                  }
                  const res = findRC(item);
                  if (res) return res;
                }
              }
              return null;
            };

            resposta = findRC(innerJson) || "";
          }

          setMessages((prevMessages) => [...prevMessages, {
            id: (Date.now() + 1).toString(),
            content: resposta,
            isUser: false,
            think: null,
            isStreaming: false,
          }]);
          break;
        }

        default: {
          const modelMapping = {
            qwen: "qwen-qwq-32b",
            compound: "compound-beta", 
            llama: "llama-3.3-70b-versatile",
            deepseek: "deepseek-r1-distill-llama-70b",
            maverick: "meta-llama/llama-4-maverick-17b-128e-instruct",
            gemma: "gemma2-9b-it",
          };

          const selectedAiModel = modelMapping[selectedModel as keyof typeof modelMapping];
          const maxTokens = AI_MODELS.find((model) => model.id === selectedModel)?.maxTokens || 8192;

          const data = {
            model: selectedAiModel,
            messages: messages,
            temperature: 0.5,
            max_completion_tokens: maxTokens,
            top_p: 1,
            stop: null,
            stream: true
          };

          const response = await fetch(modelUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
          });

          const aiMessageId = (Date.now() + 1).toString();
          setMessages((prevMessages) => [...prevMessages, {
            id: aiMessageId,
            content: "",
            isUser: false,
            think: null,
            isStreaming: true,
          }]);

          setIsLoading(false);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error("Failed to get response reader");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    resposta += parsed.choices[0].delta.content;
                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: resposta.replace(/\*\*/g, "*").trim(),
                              isStreaming: true,
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
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
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
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} (Max: {model.maxTokens} tokens)
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

// The switch statement wasn't working because the case blocks were defined as async arrow functions that weren't being executed. The functions were just being defined but never called. By wrapping the code in blocks and removing the arrow function syntax, the code now executes properly within each case.
