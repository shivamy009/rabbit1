import React, { useRef, useEffect } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';

function ChatView({ selectedWaId, messages, setMessages, conversations, messagesLoading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change or conversation is selected
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedWaId]); // Scroll when messages change or conversation changes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = e.target.message.value;
    if (!text || !selectedWaId) return;

    const newMessage = {
      msg_id: `wamid.${Date.now()}`,
      conversation_id: `conv${selectedWaId.slice(-4)}-convo-id`,
      gs_app_id: `conv${selectedWaId.slice(-4)}-app`,
      from: '918329446654',
      recipient_id: selectedWaId,
      body: text, // Changed from 'text' to 'body'
      type: 'text',
      status: 'sent',  // Starts as 'sent' (✓)
      timestamp: Math.floor(Date.now() / 1000),
      contact_name: conversations.find((c) => c.wa_id === selectedWaId)?.contact_name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Send message to backend
    await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, newMessage);
    setMessages([...messages, newMessage]);
    e.target.message.value = '';

    // Auto-scroll to bottom after sending message
    setTimeout(scrollToBottom, 100);

    // Simulate message delivery after 2 seconds (✓✓)
    setTimeout(async () => {
      const deliveredMessage = { ...newMessage, status: 'delivered' };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/${newMessage.msg_id}`, {
        status: 'delivered'
      });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.msg_id === newMessage.msg_id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 2000);

    // Simulate message read after 5 seconds (✓✓🟦)
    setTimeout(async () => {
      const readMessage = { ...newMessage, status: 'read' };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/${newMessage.msg_id}`, {
        status: 'read'
      });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.msg_id === newMessage.msg_id 
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }, 5000);
  };

  return (
    <div className="flex-1 sm:w-full md:w-2/3 flex flex-col bg-white">
      {selectedWaId ? (
        <>
          {/* Chat Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-2 sm:p-3 md:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm sm:text-base">
                  {(conversations.find((c) => c.wa_id === selectedWaId)?.contact_name || 'U')[0].toUpperCase()}
                </span>
              </div>
              
              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                  {conversations.find((c) => c.wa_id === selectedWaId)?.contact_name || 'Unknown Contact'}
                </h2>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-500 truncate">
                    <span className="hidden sm:inline">Online • </span>
                    <span className="sm:hidden">•</span>
                    <span className="hidden md:inline">{selectedWaId}</span>
                    <span className="md:hidden">{selectedWaId.substring(0, 8)}...</span>
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#f8f9fa'
            }}
          >
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start the conversation by sending a message below</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.msg_id} message={msg} isSent={msg.from === '918329446654'} />
                ))}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-2 sm:p-3 md:p-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-1 sm:space-x-2 md:space-x-3">
              {/* Emoji Button */}
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" title="Emoji">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* Attachment Button */}
              <button type="button" className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 hidden sm:block" title="Attach">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              {/* Message Input */}
              <div className="flex-1 relative min-w-0">
                <input
                  name="message"
                  type="text"
                  placeholder="Type a message..."
                  className="w-full p-2 sm:p-3 pr-8 sm:pr-12 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200 text-sm sm:text-base"
                  autoComplete="off"
                />
                
                {/* Mic Button */}
                <button type="button" className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-0.5 sm:p-1 hover:bg-gray-200 rounded-full transition-colors" title="Voice">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              
              {/* Send Button */}
              <button 
                type="submit" 
                className="p-2 sm:p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 transform hover:scale-105 flex-shrink-0"
                title="Send"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            
            {/* Typing Indicator */}
            <div className="mt-1 sm:mt-2 text-xs text-gray-500 flex items-center space-x-2">
              <span className="hidden sm:inline">Press Enter to send, Shift + Enter for new line</span>
              <span className="sm:hidden">Press Enter to send</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to WhatsApp Business</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Select a conversation from the sidebar to start chatting with your customers, 
              or use the Customer Simulator to test the interface.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Use the simulator above to create sample conversations and test message features
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatView;