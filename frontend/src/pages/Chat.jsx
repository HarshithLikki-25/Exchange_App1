import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Send, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    if (user) fetchConvos();
  }, [user]);

  useEffect(() => {
    if (activeConvo) {
      const fetchMsgs = async () => {
        setLoadingChat(true);
        try {
          const res = await api.get(`/messages/${activeConvo.id}`);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingChat(false);
        }
      };
      fetchMsgs();
      // Polling could be implemented here with setInterval
    }
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;
    try {
      const res = await api.post('/messages', {
        message_text: newMessage,
        conversation_id: activeConvo.id
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUserId = (convo) => convo.user1_id === user?.id ? convo.user2_id : convo.user1_id;

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <Helmet><title>Messages | CampusXchange</title></Helmet>

      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-black text-gray-900">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loadingList ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : conversations.length > 0 ? (
            conversations.map(c => (
              <div 
                key={c.id} 
                onClick={() => setActiveConvo(c)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${activeConvo?.id === c.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 bg-white border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeConvo?.id === c.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                  <User size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold truncate text-sm">User {getOtherUserId(c)}</p>
                  {c.last_message && (
                    <p className={`text-xs truncate ${activeConvo?.id === c.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {c.last_message.message_text}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-10 font-medium">No conversations yet.</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-slate-50 relative">
        {activeConvo ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center gap-4 z-10 sticky top-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white"><User size={20}/></div>
              <h3 className="font-bold text-lg text-gray-900">User {getOtherUserId(activeConvo)}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChat ? (
                <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-3xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'}`}>
                        <p className="text-[15px]">{m.message_text}</p>
                        <span className={`text-[10px] mt-1 block font-medium ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
                <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md">
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-800 mb-2">Your Messages</p>
            <p className="text-gray-500">Select a conversation from the sidebar to view chat or start a new exchange request.</p>
          </div>
        )}
      </div>
    </div>
  );
}
