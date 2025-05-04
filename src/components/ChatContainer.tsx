
import React, { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { WelcomeMessage } from "./WelcomeMessage";
import { useToast } from "@/components/ui/use-toast";

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
    
    // Simulate AI response with a delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Create AI response (in a real app, this would come from an API)
      const aiResponses = [
        "Olá! Como posso ajudar você hoje?",
        "Boa pergunta! Vamos explorar esse assunto juntos.",
        "Estou aqui para ajudar com suas dúvidas e necessidades.",
        "Interessante! Pode me contar mais sobre isso?",
        "Entendi o que você está perguntando. Vou tentar responder da melhor forma possível.",
        "É um prazer poder ajudar com suas perguntas.",
      ];
      
      // Select a random response
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
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
