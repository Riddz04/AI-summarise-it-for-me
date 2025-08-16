import React, { useState } from 'react';
import { Edit3, Save, Mail, Copy, Check } from 'lucide-react';
import { GeneratedSummary } from '../types';

interface SummaryDisplayProps {
  summary: GeneratedSummary;
  onEdit: (content: string) => void;
  onShare: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, onEdit, onShare }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(summary.content);
  const [isCopied, setIsCopied] = useState(false);

  const handleSave = () => {
    onEdit(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(summary.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-gray-700 mt-4 mb-2">$1</h3>')
      .replace(/^• (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-2 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
      .replace(/^\*(.*?)\*/gm, '<em>$1</em>');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generated Summary</h3>
          <p className="text-sm text-gray-500">
            Created {summary.generatedAt.toLocaleString()}
            {summary.isEdited && <span className="ml-2 text-blue-600">(Edited)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit summary"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={onShare}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Mail className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(summary.content) }}
        />
      )}
    </div>
  );
};