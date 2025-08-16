import React from 'react';
import { Lightbulb } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PROMPT_TEMPLATES = [
  'Summarize in bullet points for executives',
  'Highlight only action items and deadlines',
  'Create a brief overview for team members',
  'Focus on decisions made and next steps',
  'Extract key takeaways and follow-ups'
];

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled = false }) => {
  const handleTemplateClick = (template: string) => {
    if (!disabled) {
      onChange(template);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          AI Instructions
        </label>
        <textarea
          id="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          placeholder="Tell the AI how you'd like your meeting notes summarized..."
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Be specific about the format and focus you want
          </p>
          <span className="text-xs text-gray-400">
            {value.length}/500
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">Quick Templates</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_TEMPLATES.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateClick(template)}
              disabled={disabled}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};