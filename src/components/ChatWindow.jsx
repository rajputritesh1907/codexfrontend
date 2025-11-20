import React, { useEffect, useRef, useState } from 'react';
import { MdClose, MdSend } from 'react-icons/md';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Storage key name
const GEMINI_STORAGE_KEY = 'gemini_chat_history';

const ChatWindow = ({ chat, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load Gemini chat history from localStorage (bot-only)
  useEffect(() => {
    const saved = localStorage.getItem(GEMINI_STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, []);

  // Save Gemini chat history to localStorage
  useEffect(() => {
    localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);

    // Add user message
    const newMessages = [...messages, { sender: currentUser || 'You', content: input, isUser: true }];
    setMessages(newMessages);
    localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify(newMessages));

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(input.trim());
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => {
        const updated = [...prev, { sender: 'Gemini Bot', content: text, isBot: true }];
        localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Gemini Error:", err);
      setMessages((prev) => {
        const updated = [...prev, { sender: 'Gemini Bot', content: 'Error connecting to Gemini API. Please check your API key.', isBot: true }];
        localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full h-full sm:w-full sm:max-w-md bg-dark-800/95 border border-dark-600/50 rounded-none sm:rounded-2xl shadow-none sm:shadow-2xl flex flex-col sm:h-[500px]">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-600/50 sticky top-0 z-10 bg-dark-800/95">
        <div className="font-bold text-lg">Gemini Chatbot</div>
        <div className="flex gap-2 items-center">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors duration-200" aria-label="Close chat">
            <MdClose className="text-xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-dark-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === currentUser || msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[78%] sm:max-w-xs md:max-w-sm ${msg.sender === currentUser || msg.isUser ? 'bg-primary-500 text-white' : msg.isBot ? 'bg-green-700 text-white' : 'bg-dark-600 text-white'}`}>
              <div className="text-sm">{msg.content}</div>
              <div className="text-xs text-dark-300 mt-1 text-right">{msg.sender}</div>
            </div>
          </div>
        ))}
        {/* {loading && <div className="text-center text-xs text-dark-300">Loading...</div>} */}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex p-3 sm:p-4 border-t border-dark-600/50 gap-2 sticky bottom-0 bg-dark-800/95 pb-[env(safe-area-inset-bottom)]">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-lg bg-dark-700 text-white border border-dark-600 focus:outline-none min-h-[44px]"
          placeholder="Ask Gemini anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium min-w-12" disabled={loading}>
          <MdSend className="text-lg" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;