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
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/20 shadow-lg">
          <MessageSquare size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Messages</h1>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 shadow-2xl flex h-[80%] overflow-hidden">
        
        {/* Left Panel: Conversations List */}
        <div className={`w-full md:w-1/3 border-r border-white/10 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-white font-bold text-lg">Recent Chats</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConvos ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : conversations.length > 0 ? (
              conversations.map(c => {
                const otherUser = getOtherUser(c);
                const isActive = activeConvo?.id === c.id;
                return (
                  <div 
                    key={c.id} 
                    onClick={() => handleSelectConvo(c)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex items-center gap-3 ${isActive ? 'bg-blue-500/20 shadow-inner' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {otherUser?.profile_image_url ? (
                        <img src={otherUser.profile_image_url} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="text-white/50 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{otherUser?.name || `User ${otherUser?.id || getOtherUser(c)?.id || 'Unknown'}`}</h3>
                      <p className="text-white/50 text-sm truncate">{c.last_message?.message_text || 'No messages yet'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 font-medium">No conversations yet.</p>
                <p className="text-white/30 text-sm mt-2">Find an item you like and send a message!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className={`w-full md:w-2/3 flex flex-col bg-black/20 ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <button 
                  onClick={() => setActiveConvo(null)}
                  className="md:hidden p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden">
                  {getOtherUser(activeConvo)?.profile_image_url ? (
                    <img src={getOtherUser(activeConvo).profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="text-white/50 w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-white font-bold">{getOtherUser(activeConvo)?.name || `User ${getOtherUser(activeConvo)?.id || 'Unknown'}`}</h2>
                  <p className="text-white/40 text-xs">Connected</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id || idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${
                            isMe 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm' 
                              : 'bg-white/10 border border-white/10 text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm md:text-base">{msg.message_text}</p>
                          <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-100/70 text-right' : 'text-white/40 text-left'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <p className="bg-white/5 px-4 py-2 rounded-full text-sm">This is the start of your conversation.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} className="ml-1" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay">
              <MessageSquare className="w-20 h-20 mb-6 opacity-20" />
              <h2 className="text-2xl font-bold text-white/50 mb-2">Your Messages</h2>
              <p>Select a conversation from the sidebar to start chatting.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
