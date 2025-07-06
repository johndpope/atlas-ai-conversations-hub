import React from "react";
import { Button } from "./ui/button";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-slate-500 font-medium">Follow-up suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-300"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};