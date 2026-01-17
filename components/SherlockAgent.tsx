import React, { useState, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleGenerativeAI, InlineDataPart } from "@google/generative-ai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SherlockAgent = ({ imageFile, onSummaryReady }: { imageFile: File, onSummaryReady: (summary: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatSession, setChatSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- INTERNAL AI SETUP ---
  const initGeminiSession = async () => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    
    // FIX: Using 'gemini-flash-latest' which is the standard, high-quota model alias
    // explicitly listed in your allowed models list.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest", 
    });

    console.log("Initializing Chat with: gemini-flash-latest");

    return model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are Sherlock, a detective finding lost items. Ask 2 short questions to identify the specific item in the image." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will be brief and look for unique identifiers." }],
        }
      ],
    });
  };

  useEffect(() => {
    const initChat = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const session = await initGeminiSession();
        setChatSession(session);
        
        const imagePart = await fileToGenerativePart(imageFile);
        
        const result = await session.sendMessage([
          "Analyze this image.", 
          imagePart
        ]);
        
        setMessages([{ role: 'model', text: result.response.text() }]);
      } catch (err: any) {
        console.error("Sherlock Error:", err);
        
        // Custom Error Handling for Quotas
        let msg = err.message || "Unknown error";
        if (msg.includes("429")) {
          msg = "Usage Limit Reached (429). The AI is busy. Please wait 1 minute and try again.";
        } else if (msg.includes("404")) {
           msg = "Model Error (404). Please ensure your API Key is from Google AI Studio.";
        }
        
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageFile) initChat();
  }, [imageFile]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: result.response.text() }]);
      
      if (messages.length >= 2) {
        const summaryReq = await chatSession.sendMessage("Write a one-paragraph description of this item for the database.");
        onSummaryReady(summaryReq.response.text());
      }
    } catch (err: any) {
      // Handle mid-chat rate limits
      if (err.message.includes("429")) {
         setError("Rate limit reached. Please wait a moment.");
      } else {
         setError(`Chat Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function fileToGenerativePart(file: File): Promise<InlineDataPart> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve({
          inlineData: {
            data: result.split(',')[1],
            mimeType: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-600" />
        <h3 className="font-bold text-slate-700">Sherlock AI Agent</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
             <b>Connection Failed:</b> {error}
             {error.includes("429") && (
               <button 
                 onClick={() => window.location.reload()} 
                 className="block mt-2 text-blue-600 underline hover:text-blue-800"
               >
                 Reload Page to Retry
               </button>
             )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 min-h-[200px] custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-slate-400 italic p-2">Sherlock is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-md text-sm"
          placeholder={error ? "Chat disabled" : "Reply here..."}
          disabled={!!error || isLoading}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!!error || isLoading} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-slate-300">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};