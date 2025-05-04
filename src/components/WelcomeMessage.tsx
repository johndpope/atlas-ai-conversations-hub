
import React from "react";

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 text-center">
      <div className="mx-auto h-16 w-16 rounded-full chat-gradient flex items-center justify-center mb-4">
        <span className="text-white font-bold text-xl">A</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Atlas AI</h2>
      <p className="text-gray-600 max-w-lg mx-auto">
        Olá! Eu sou o Atlas, seu assistente de IA. Estou aqui para ajudar com suas perguntas, 
        esclarecer dúvidas, ou simplesmente conversar. Como posso te ajudar hoje?
      </p>
    </div>
  );
};
