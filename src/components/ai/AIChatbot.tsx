import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, MapPin, Bus, DollarSign, Gift } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isForm?: boolean;
};

export const AIChatbot: React.FC = () => {
  const routerLocation = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', sender: 'ai', text: "Kumusta! I'm your Pamasahe Guide. Need help with your commute or want to report a missing terminal? I'm here for you!" }
  ]);
  const [input, setInput] = useState('');
  const [showReward, setShowReward] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Intent Recognition Logic
    const lowerInput = input.toLowerCase();
    const isMissingIntent = ['wala', 'missing', 'terminal', 'cant find', 'not here'].some(kw => lowerInput.includes(kw));

    setTimeout(() => {
      if (isMissingIntent) {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now().toString(), 
            sender: 'ai', 
            text: "I see! If you can't find a terminal or route, help the community by adding it here.",
            isForm: true
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now().toString(), 
            sender: 'ai', 
            text: "I can help you navigate or you can report missing routes to me. Just let me know what you need!"
          }
        ]);
      }
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Dispatch
    setTimeout(() => {
      setMessages(prev => prev.filter(m => !m.isForm));
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now().toString(), 
          sender: 'ai', 
          text: 'Thank you! I have sent this information to the team for review. It will be added to the map soon.'
        }
      ]);
      setShowReward(true);
    }, 800);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {(routerLocation.pathname === '/home' || routerLocation.pathname === '/trip') && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-48 right-4 z-10 w-14 h-14 bg-[#1a00b2] text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center border-2 border-white/20"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            />
            
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-[80vh] sm:h-[600px] bg-gray-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-[#1a00b2] text-white p-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">Pamasahe Guide</h3>
                    <p className="text-xs text-blue-200">Community Support</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-[#1a00b2] text-white rounded-br-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      
                      {/* Dynamic Form */}
                      {msg.isForm && (
                        <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Crowdsource Report</p>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input required type="text" placeholder="Location Name (e.g. Puregold Bacoor)" className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1a00b2] outline-none" />
                          </div>
                          <div className="relative">
                            <Bus size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select required className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1a00b2] outline-none appearance-none">
                              <option value="">Select Vehicle Type</option>
                              <option value="jeep">Jeepney</option>
                              <option value="tricycle">Tricycle Terminal</option>
                              <option value="bus">Bus Stop</option>
                            </select>
                          </div>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input required type="number" placeholder="Estimated Fare (₱)" className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1a00b2] outline-none" />
                          </div>
                          <button type="submit" className="w-full bg-[#1a00b2] text-white font-bold py-2.5 rounded-lg active:scale-95 transition-transform text-sm shadow-md mt-2">
                            Submit Report
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-full border border-gray-200 p-1 pr-2 focus-within:border-[#1a00b2] focus-within:ring-1 focus-within:ring-[#1a00b2] transition-all shadow-inner">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-gray-700"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-[#1a00b2] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {showReward && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative bg-gradient-to-b from-[#f2ca4b] to-[#f0b90b] w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl overflow-hidden"
            >
              {/* Confetti Background effect (simplified) */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-[#f2ca4b]/50">
                  <Gift size={40} className="text-[#1a00b2]" />
                </div>
                <h2 className="text-3xl font-black text-[#1a00b2] mb-2 tracking-tight">Success!</h2>
                <p className="text-gray-900 font-medium mb-6">Thanks for helping the community! Here's a reward for your effort.</p>
                
                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-8 shadow-inner border border-white/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Reward</p>
                  <p className="text-lg font-black text-[#1a00b2]">Free Ad-Block Trial</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">Enjoy an uninterrupted experience for 30 days.</p>
                </div>

                <button 
                  onClick={() => setShowReward(false)}
                  className="w-full bg-[#1a00b2] text-white font-black text-lg py-4 rounded-2xl shadow-xl active:scale-95 transition-transform"
                >
                  Claim Reward
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
