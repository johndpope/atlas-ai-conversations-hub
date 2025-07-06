import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { LanguageSelector } from "./LanguageSelector";

interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-4 px-6 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <h1 className="text-xl font-bold logo-text text-center">Atlas AI</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};
