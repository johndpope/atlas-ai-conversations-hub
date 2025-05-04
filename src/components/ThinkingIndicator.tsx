
import React from "react";

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 py-4 px-6 message-ai">
      <div className="shrink-0">
        <div className="h-8 w-8 rounded-full chat-gradient flex items-center justify-center">
          <span className="text-white font-semibold text-sm">A</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm text-slate-700">Atlas AI</p>
        <div className="mt-1 flex items-center">
          <div className="thinking-dots flex space-x-1">
            <span className="h-2 w-2 bg-primary rounded-full"></span>
            <span className="h-2 w-2 bg-primary rounded-full"></span>
            <span className="h-2 w-2 bg-primary rounded-full"></span>
          </div>
          <span className="ml-2 text-sm text-gray-500">Pensando...</span>
        </div>
      </div>
    </div>
  );
};
