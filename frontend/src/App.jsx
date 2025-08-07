import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from './socket';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import CustomerSimulator from './components/CustomerSimulator';
 

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedWaId, setSelectedWaId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true); // For conversations loading
  const [messagesLoading, setMessagesLoading] = useState(false); // For messages loading

  useEffect(() => {
    // Fetch conversations ONLY ONCE when app loads
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/conversations`).then((res) => {
      setConversations(res.data);
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    });
  }, []); // Empty dependency array - runs only once

  useEffect(() => {
    // Socket.IO listeners - update when selectedWaId changes
    socket.on('newMessage', (message) => {
      if (message.from === selectedWaId || message.recipient_id === selectedWaId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('statusUpdate', (update) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msg_id === update.msg_id ? { ...msg, status: update.status, updatedAt: update.updatedAt } : msg
        )
      );
    });

    return () => {
      socket.off('newMessage');
      socket.off('statusUpdate');
    };
  }, [selectedWaId]); // Only socket listeners depend on selectedWaId

  useEffect(() => {
    if (selectedWaId) {
      setMessagesLoading(true);
      axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${selectedWaId}`).then((res) => {
        setMessages(res.data);
        setMessagesLoading(false);
      }).catch((error) => {
        console.error('Error fetching messages:', error);
        setMessagesLoading(false);
      });
    }
  }, [selectedWaId]);

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">📱</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">WhatsApp Business</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Professional Chat Interface</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">Online</span>
                <span className="sm:hidden">•</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Simulator */}
      <CustomerSimulator conversations={conversations} />
      
      {/* Main Chat Interface */}
      <div className="flex flex-1 bg-white rounded-t-3xl shadow-2xl mx-2 sm:mx-4 mb-2 sm:mb-4 overflow-hidden">
        <ConversationList conversations={conversations} setSelectedWaId={setSelectedWaId} selectedWaId={selectedWaId} loading={loading} />
        <ChatView
          selectedWaId={selectedWaId}
          messages={messages}
          setMessages={setMessages}
          conversations={conversations}
          messagesLoading={messagesLoading}
        />
      </div>
    </div>
  );
}

export default App;