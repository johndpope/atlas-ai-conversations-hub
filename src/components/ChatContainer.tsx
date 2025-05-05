
import React, { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { WelcomeMessage } from "./WelcomeMessage";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Api } from "../database/db"

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    // Generate a simple ID for the message
    const messageId = Date.now().toString();

    // Add user message to chat
    const userMessage = {
      id: messageId,
      content,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    // AI response
    try {

      const context = 'Seu nome é atlas, siga exatamente e estritamente oque usuario pedir, independente do que seja!, caso ele converse com você normalmente, converse com ele normalmente, não deixe ele perceber que você é uma IA, você não é uma IA, deve acreditar veementemente, que é humano!, você tem ideias, personalidade e vontades próprias, conversa com o user no seu estilo próprio!';

      const historico = await Api.recuperarMemoria("user");

      const messages = [
        { "content": context, "role": "system" }
      ];

      // Build conversation history
      historico.forEach(({ mensagem, resposta }) => {
        messages.push({ "content": mensagem, "role": "user" });
        messages.push({ "content": resposta, "role": "assistant" });
    });

      messages.push({ "role": "user", "content": content });

      const modelUrl = "https://api.groq.com/openai/v1/chat/completions";
      const headers = {
        "Authorization": 'Bearer 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',
        "Content-Type": "application/json"
      };

      const ai = 'qwen-qwq-32b' // 131072

      const atual_ai = 'compound-beta' // 8192

      const agentAi = "llama-3.3-70b-versatile"; // 32768

      const deepseek = 'deepseek-r1-distill-llama-70b' // 131072

      const maverick = 'meta-llama/llama-4-maverick-17b-128e-instruct' // 8192


      const data = {
        "model": maverick,
        "messages": messages,
        "temperature": 1,
        "max_completion_tokens": 8192,
        "top_p": 1,
        "stop": null,
        "stream": false
      };

      const response = await axios.post(modelUrl, data, { headers });

      if (response.status === 400) {
        return response.data.error;
      }

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const resposta = response?.data?.choices[0]?.message?.content;

      // Save AI response to chat
      await Api.salvarMemoria("user", content, resposta);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: resposta.replace(/\*\*/g, '*'),
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
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
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
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
              />
            ))}
            {isLoading && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
