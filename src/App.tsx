import React, { useState } from 'react';
import { Brain, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { PromptInput } from './components/PromptInput';
import { SummaryDisplay } from './components/SummaryDisplay';
import { EmailModal } from './components/EmailModal';
import { generateSummary } from './utils/groqService';
import { sendEmail } from './utils/emailService';
import { GeneratedSummary, EmailRecipient } from './types';

type AppState = 'upload' | 'prompt' | 'generating' | 'summary';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [transcript, setTranscript] = useState('');
  const [filename, setFilename] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState<GeneratedSummary | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (content: string, name: string) => {
    setTranscript(content);
    setFilename(name);
    if (content.trim()) {
      setState('prompt');
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim() || !prompt.trim()) return;

    setIsGenerating(true);
    setState('generating');
    
    try {
      const result = await generateSummary({ transcript, customPrompt: prompt });
      setSummary(result);
      setState('summary');
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate summary. Please try again.');
      setState('prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditSummary = (content: string) => {
    if (summary) {
      setSummary({
        ...summary,
        content,
        isEdited: true
      });
    }
  };

  const handleShareSummary = async (recipients: EmailRecipient[], subject: string, message: string) => {
    if (!summary) return;
    
    try {
      await sendEmail({
        recipients: recipients.map(r => r.email),
        subject,
        message,
        summary: summary.content,
        senderName: 'AI Meeting Summarizer'
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error; // Re-throw to be handled by EmailModal
    }
  };

  const resetFlow = () => {
    setState('upload');
    setTranscript('');
    setFilename('');
    setPrompt('');
    setSummary(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Meeting Summarizer</h1>
                <p className="text-sm text-gray-600">Transform transcripts into actionable summaries</p>
              </div>
            </div>
            {state !== 'upload' && (
              <button
                onClick={resetFlow}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                New Summary
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center space-x-2 ${state === 'upload' ? 'text-blue-600' : state === 'prompt' || state === 'generating' || state === 'summary' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state === 'upload' ? 'bg-blue-100 border-2 border-blue-600' : state === 'prompt' || state === 'generating' || state === 'summary' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  {state === 'prompt' || state === 'generating' || state === 'summary' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <span className="font-medium">Upload</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${state === 'prompt' ? 'text-blue-600' : state === 'generating' || state === 'summary' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state === 'prompt' ? 'bg-blue-100 border-2 border-blue-600' : state === 'generating' || state === 'summary' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  {state === 'generating' || state === 'summary' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                </div>
                <span className="font-medium">AI Instructions</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${state === 'summary' ? 'text-green-600' : state === 'generating' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state === 'summary' ? 'bg-green-100 border-2 border-green-600' : state === 'generating' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-medium">Summary</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Meeting Transcript</h2>
              <p className="text-lg text-gray-600">
                Start by uploading a text file containing your meeting notes or call transcript
              </p>
            </div>
            
            <FileUpload onFileContent={handleFileUpload} />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Supported format: .txt files only
              </p>
              <div className="inline-flex items-center space-x-4 text-xs text-gray-400">
                <span>• Secure processing</span>
                <span>• No data stored</span>
                <span>• Instant AI analysis</span>
              </div>
            </div>
          </div>
        )}

        {state === 'prompt' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Customize Your AI Instructions</h2>
              <p className="text-lg text-gray-600">
                Tell the AI exactly how you'd like your meeting notes to be summarized
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                    {transcript.length > 500 
                      ? `${transcript.substring(0, 500)}...`
                      : transcript
                    }
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  File: {filename} • {transcript.split(' ').length} words
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <PromptInput value={prompt} onChange={setPrompt} />
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={!transcript.trim() || !prompt.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Summary</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'generating' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200">
              <div className="animate-spin w-16 h-16 mx-auto mb-6">
                <Brain className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                AI is Analyzing Your Transcript
              </h2>
              <p className="text-gray-600 mb-4">
                Processing your meeting notes and generating a structured summary...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {state === 'summary' && summary && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your AI-Generated Summary</h2>
              <p className="text-lg text-gray-600">
                Review, edit, and share your structured meeting summary
              </p>
            </div>

            <SummaryDisplay
              summary={summary}
              onEdit={handleEditSummary}
              onShare={() => setIsEmailModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Email Modal */}
      {summary && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          summary={summary}
          onSend={handleShareSummary}
        />
      )}
    </div>
  );
}

export default App;