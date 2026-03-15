import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Send, User as UserIcon, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize from location state if we navigated here to start a new chat
  useEffect(() => {
    if (location.state?.recipientId) {
      const recipientId = location.state.recipientId;
      const recipientName = location.state.recipientName || 'User';
      
      // Check if we already have a convo with this person
      const existing = conversations.find(c => c.user1_id === recipientId || c.user2_id === recipientId);
      
      if (existing) {
        handleSelectConvo(existing);
      } else {
        // Create a temporary active convo for the UI
        setActiveConvo({
          isNew: true,
          recipientId,
          otherUser: { name: recipientName }
        });
        setMessages([]);
      }
      
      // Clear history state to avoid loops
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !activeConvo && !location.state?.recipientId) {
        handleSelectConvo(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoadingConvos(false);
    }
  };

  const handleSelectConvo = async (convo) => {
    setActiveConvo(convo);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await api.get(`/messages/${convo.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const payload = { message_text: newMessage };
      
      if (activeConvo.isNew) {
        payload.recipient_id = activeConvo.recipientId;
      } else {
        payload.conversation_id = activeConvo.id;
      }
      
      const res = await api.post('/messages', payload);
      
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      
      // If it was a new conversation, refresh the list
      if (activeConvo.isNew) {
        fetchConversations();
        // The fetchConversations will update the activeConvo from the server
      } else {
        // Update last message in the list
        setConversations(prev => prev.map(c => 
          c.id === activeConvo.id ? { ...c, last_message: res.data } : c
        ));
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (convo) => {
    if (convo.isNew) return convo.otherUser;
    return convo.user1_id === user.id ? convo.user2 : convo.user1;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-100px)]">
      <Helmet><title>Messages | CampusXchange</title></Helmet>
      
      <div className="flex items-center space-x-6 mb-10 pb-8 border-b border-slate-100">
        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
          <MessageSquare size={32} className="-rotate-3" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase">your messages</h1>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-slate-200 shadow-2xl flex h-[85%] overflow-hidden bg-white/70">
        
        {/* Left Panel: Conversations List */}
        <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50 bg-white/30">
            <h2 className="text-slate-900 font-extrabold text-xl">Recent Chats</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loadingConvos ? (
              <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-slate-900" /></div>
            ) : conversations.length > 0 ? (
              conversations.map(c => {
                const otherUser = getOtherUser(c);
                const isActive = activeConvo?.id === c.id;
                return (
                  <div 
                    key={c.id} 
                    onClick={() => handleSelectConvo(c)}
                    className={`p-6 border-b border-slate-50 cursor-pointer transition-all flex items-center gap-4 ${isActive ? 'bg-slate-900 text-white shadow-2xl' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {otherUser?.profile_image_url ? (
                        <img src={otherUser.profile_image_url} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="text-slate-400 w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black truncate tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>{otherUser?.name || `User ${otherUser?.id || getOtherUser(c)?.id || 'Unknown'}`}</h3>
                      <p className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{c.last_message?.message_text || 'No messages yet'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-extrabold text-sm">No conversations yet.</p>
                <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest mt-3 leading-relaxed">Find an item you like and send a message!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-slate-50 bg-white flex items-center gap-4 z-10 shadow-sm">
                <button 
                  onClick={() => setActiveConvo(null)}
                  className="md:hidden p-3 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={22} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {getOtherUser(activeConvo)?.profile_image_url ? (
                    <img src={getOtherUser(activeConvo).profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="text-slate-400 w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-slate-900 font-black text-lg">{getOtherUser(activeConvo)?.name || `User ${getOtherUser(activeConvo)?.id || 'Unknown'}`}</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-pulse"></span>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Active Now</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-slate-900" /></div>
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={msg.id || idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-[2.5rem] px-8 py-5 shadow-2xl ${
                            isMe 
                              ? 'bg-slate-900 text-white rounded-br-none' 
                              : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm md:text-base font-medium leading-relaxed">{msg.message_text}</p>
                          <span className={`text-[9px] mt-3 block font-black uppercase tracking-widest ${isMe ? 'text-slate-400 text-right' : 'text-slate-300 text-left'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="bg-slate-50 text-slate-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-slate-100">Beginning of conversation</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-200">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message your campus neighbor..."
                    className="flex-1 bg-transparent border-none px-6 py-3 text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl hover:bg-black transition-all z-10"
                  >
                    {sending ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send size={28} className="ml-1" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20 backdrop-blur-sm">
              <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] mb-10 border border-slate-100 rotate-6 transition-transform hover:rotate-0 duration-700">
                <MessageSquare className="w-12 h-12 text-slate-900 -rotate-6 group-hover:rotate-0 transition-transform" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Your Inbox</h2>
              <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">Select a neighbor from the left to view your exchange details and negotiate pick-ups.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
