'use client';

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      setIsOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-14 h-14 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all z-40 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : ''}`}
        aria-label="Open live chat"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full border-2 border-white"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            <div className="bg-brand-blue p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm">Live Chat</h4>
                  <p className="text-xs text-blue-100">We typically reply in minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex-1 overflow-y-auto min-h-[200px] flex flex-col gap-3">
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-700 w-[85%]">
                Hello! 👋 Welcome to Genfinity O&P. How can we help you today?
              </div>
              {sent && (
                <div className="bg-brand-blue text-white p-3 rounded-2xl rounded-tr-sm shadow-sm text-sm self-end w-[85%]">
                  {message}
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              {sent ? (
                <div className="text-sm text-center text-brand-blue font-medium py-2">
                  Message sent! We&apos;ll reply shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="absolute right-1.5 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                  >
                    <Send className="w-4 h-4 -ml-0.5" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
