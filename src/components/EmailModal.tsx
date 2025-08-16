import React, { useState } from 'react';
import { X, Mail, Send, Plus, Trash2, Check } from 'lucide-react';
import { GeneratedSummary, EmailRecipient } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: GeneratedSummary;
  onSend: (recipients: EmailRecipient[], subject: string, message: string) => Promise<void>;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, summary, onSend }) => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([{ email: '', name: '' }]);
  const [subject, setSubject] = useState(`Meeting Summary - ${new Date().toLocaleDateString()}`);
  const [message, setMessage] = useState('Please find the meeting summary attached below.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof EmailRecipient, value: string) => {
    const updated = recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setRecipients(updated);
  };

  const handleSend = async () => {
    const validRecipients = recipients.filter(r => r.email.trim() !== '');
    if (validRecipients.length === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await onSend(validRecipients, subject, message);
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        onClose();
        setRecipients([{ email: '', name: '' }]);
        setSubject(`Meeting Summary - ${new Date().toLocaleDateString()}`);
        setMessage('Please find the meeting summary attached below.');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Recipients</label>
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeRecipient(index)}
                  disabled={recipients.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addRecipient}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add recipient</span>
            </button>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary Preview</h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                {summary.content.length > 300 
                  ? summary.content.substring(0, 300) + '...'
                  : summary.content
                }
              </pre>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Email sent successfully!</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || recipients.every(r => r.email.trim() === '')}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Sending...' : 'Send Summary'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};