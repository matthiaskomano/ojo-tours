"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import {
  getBestResponse,
  getWelcomeMessage,
  getQuickActions,
  getTypingIndicator,
  ChatbotResponse,
} from "@/lib/chatbot/search-engine";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && !isTyping) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, isTyping]);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && !hasWelcomed) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setHasWelcomed(true);
    }
  }, [isOpen, hasWelcomed]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay for natural feel
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 700),
    );

    // Get response from search engine
    const response: ChatbotResponse = getBestResponse(content);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: response.answer,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (question: string) => {
    setInputValue(question);
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const quickActions = getQuickActions();

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed md:bottom-6 bottom-4 right-6 z-50 bg-[#F1D592] text-[#040C08] p-4 rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Open chat"
      >
        <MessageCircle size={28} strokeWidth={2} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 bg-[#0A1A12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isMinimized ? "h-14 w-80" : "h-[500px] w-80 md:w-96"
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-[#1B3022] to-[#0A1A12] px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F1D592] flex items-center justify-center">
                  <Bot size={18} className="text-[#040C08]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    OJO Assistant
                  </h3>
                  <p className="text-[#F1D592] text-xs">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 size={18} />
                  ) : (
                    <Minimize2 size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-red-400 transition-colors p-1"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.type === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-[#F1D592] flex items-center justify-center shrink-0">
                          <Bot size={16} className="text-[#040C08]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.type === "user"
                            ? "bg-[#F1D592] text-[#040C08] rounded-br-sm"
                            : "bg-white/10 text-white rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F1D592] flex items-center justify-center shrink-0">
                        <Bot size={16} className="text-[#040C08]" />
                      </div>
                      <div className="bg-white/10 text-white rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2 shrink-0">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.slice(0, 3).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action)}
                          className="text-xs bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-[#0A1A12] shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about tours, bookings..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F1D592]/50 focus:bg-white/10 transition-all placeholder-white/30"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-[#F1D592] hover:bg-[#F1D592]/80 text-[#040C08] p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F1D592]"
                      aria-label="Send message"
                    >
                      {isTyping ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
