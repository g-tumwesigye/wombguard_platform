import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatbotService } from '../services/apiService';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initializing conversation
  useEffect(() => {
  const initializeConversation = async () => {
  // Generate conversation ID for both authenticated and anonymous users
  const userId = user?.id || 'anonymous';
  
  try {
  const response = await chatbotService.startNewConversation(userId);
  setConversationId(response.conversation_id);
  } catch (err) {
  console.error('Failed to initialize conversation:', err);
  // Fallback: generate a local conversation ID if backend fails
  setConversationId(`local-${Date.now()}`);
  }

  // Adding welcome message
  setMessages([{
  id: 'welcome',
  type: 'bot',
  text: 'Hello! I\'m WombGuardBot, your AI-powered pregnancy health assistant. I\'m here to provide personalized maternal care guidance and answer your pregnancy-related questions. How can I help you today?',
  timestamp: new Date()
  }]);
  };

  initializeConversation();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
  e.preventDefault();

  if (!inputValue.trim()) return;

  // Storing the message before clearing the input
  const messageText = inputValue;

  // Adding user message to chat
  const userMessage = {
  id: Date.now(),
  type: 'user',
  text: messageText,
  timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setLoading(true);
  setError('');

  try {
  // Sending to FastAPI chatbot endpoint
  const response = await chatbotService.sendMessage(
  messageText,
  user?.id || 'anonymous',
  conversationId
  );

  // Adding bot response
  const botMessage = {
  id: Date.now() + 1,
  type: 'bot',
  text: response.response,
  timestamp: new Date()
  };

  setMessages(prev => [...prev, botMessage]);

  if (response.conversation_id) {
  setConversationId(response.conversation_id);
  }
  } catch (err) {
  setError(err.message || 'Failed to send message');

  // Adding error message to chat
  const errorMessage = {
  id: Date.now() + 1,
  type: 'error',
  text: 'Sorry, I encountered an error processing your message. Please try again.',
  timestamp: new Date()
  };
  setMessages(prev => [...prev, errorMessage]);
  } finally {
  setLoading(false);
  }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
  <div className="max-w-2xl mx-auto h-screen flex flex-col">
  {/* Header */}
  <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-neutral-200">
  <div className="flex items-center gap-3 mb-2">
  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-10 h-10 rounded-full flex items-center justify-center">
  <MessageCircle className="h-6 w-6 text-white" />
  </div>
  <div>
  <h1 className="text-2xl font-bold text-neutral-900">WombGuardBot</h1>
  <p className="text-sm text-neutral-600">Your AI-powered pregnancy health assistant</p>
  </div>
  </div>
  </div>

  {/* Messages Container */}
  <div className="flex-1 bg-white overflow-y-auto p-6 space-y-4">
  {messages.length === 0 ? (
  <div className="flex items-center justify-center h-full">
  <div className="text-center">
  <MessageCircle className="h-16 w-16 text-primary-200 mx-auto mb-4" />
  <p className="text-neutral-600">Start a conversation...</p>
  </div>
  </div>
  ) : (
  messages.map((message) => (
  <div
  key={message.id}
  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
  >
  <div
  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
  message.type === 'user'
  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-none'
  : message.type === 'error'
  ? 'bg-red-100 text-red-800 rounded-bl-none'
  : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
  }`}
  >
  <p className="text-sm">{message.text}</p>
  <p className={`text-xs mt-1 ${
  message.type === 'user' ? 'text-primary-100' : 'text-neutral-500'
  }`}>
  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </p>
  </div>
  </div>
  ))
  )}

  {loading && (
  <div className="flex justify-start">
  <div className="bg-neutral-100 text-neutral-900 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
  <Loader className="h-4 w-4 animate-spin" />
  <span className="text-sm">WombGuardBot is typing...</span>
  </div>
  </div>
  )}

  <div ref={messagesEndRef} />
  </div>

  {/* Error Alert */}
  {error && (
  <div className="bg-red-50 border-t border-red-200 px-6 py-3 flex items-start gap-3">
  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
  <p className="text-sm text-red-700">{error}</p>
  </div>
  )}

  {/* Input Area */}
  <div className="bg-white rounded-b-2xl shadow-lg p-6 border-t border-neutral-200">
  <form onSubmit={handleSendMessage} className="flex gap-3">
  <input
  type="text"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  placeholder="Ask me anything about your pregnancy health..."
  disabled={loading}
  className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-neutral-100"
  />
  <button
  type="submit"
  disabled={loading || !inputValue.trim()}
  className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  >
  <Send className="h-5 w-5" />
  <span className="hidden sm:inline">Send</span>
  </button>
  </form>

  <p className="text-xs text-neutral-500 mt-3 text-center">
  Disclaimer: This chatbot provides general information only. Always consult with your healthcare provider for medical advice.
  </p>
  </div>
  </div>
  </div>
  );
};

export default Chatbot;