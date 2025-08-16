import Groq from 'groq-sdk';
import { SummaryRequest, GeneratedSummary } from '../types';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateSummary = async (request: SummaryRequest): Promise<GeneratedSummary> => {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Please add your API key to the .env file.');
  }

  try {
    const systemPrompt = `You are an expert meeting summarizer. Your task is to analyze meeting transcripts and create structured, professional summaries based on specific user instructions.

Guidelines:
- Follow the user's custom instructions exactly
- Use clear, professional language
- Structure the output with proper headings and formatting
- Use markdown formatting for better readability
- Be concise but comprehensive
- Focus on actionable insights and key decisions`;

    const userPrompt = `Please analyze this meeting transcript and create a summary based on these specific instructions: "${request.customPrompt}"

Meeting Transcript:
${request.transcript}

Please format your response using markdown with clear headings and structure.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama3-70b-8192", // Fast and capable model
      temperature: 0.3, // Lower temperature for more consistent, professional output
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response generated from Groq API');
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      prompt: request.customPrompt,
      generatedAt: new Date(),
      isEdited: false
    };

  } catch (error) {
    console.error('Groq API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Groq API key. Please check your API key in the .env file.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Groq account.');
      }
    }
    
    throw new Error('Failed to generate summary. Please try again.');
  }
};