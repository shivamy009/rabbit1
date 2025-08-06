import React, { useState } from 'react';

function CustomerSimulator({ conversations }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const simulateCustomerReply = async (customerWaId, customerName) => {
    const replies = [
      "Thanks for your message! 😊",
      "That sounds good to me.",
      "Can you tell me more about this?",
      "I'm interested in this offer!",
      "When can we schedule a call? 📞",
      "What are your prices? 💰",
      "Perfect, let's proceed! ✅",
      "I'll think about it and get back to you.",
      "Do you have any other options?",
      "This looks exactly what I need! 🎯"
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const customerMessage = {
      msg_id: `wamid.customer.${Date.now()}`,
      conversation_id: `conv${customerWaId.slice(-4)}-convo-id`,
      gs_app_id: `conv${customerWaId.slice(-4)}-app`,
      from: customerWaId,
      recipient_id: '918329446654',
      text: randomReply,
      type: 'text',
      status: 'delivered',
      timestamp: Math.floor(Date.now() / 1000),
      contact_name: customerName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerMessage)
      });
      
      // Show success notification (responsive)
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 text-sm sm:text-base';
      notification.innerHTML = `✅ ${customerName} replied: "${randomReply.length > 30 ? randomReply.substring(0, 30) + '...' : randomReply}"`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (error) {
      console.error('Error sending customer reply:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm mx-1 sm:mx-2 md:mx-4 mt-4 max-w-full overflow-hidden">
      {/* Header */}
      <div 
        className="p-2 sm:p-3 md:p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 overflow-hidden">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm md:text-lg">🎭</span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="font-bold text-blue-800 text-xs sm:text-sm md:text-base truncate">Customer Simulator</h3>
              <p className="text-xs sm:text-sm text-blue-600 truncate">
                <span className="hidden md:inline">Simulate customer responses • </span>
                {conversations.length} contact{conversations.length !== 1 ? 's' : ''}
                <span className="hidden md:inline"> available</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="bg-blue-100 text-blue-700 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
              <span className="hidden md:inline">Demo </span>Mode
            </div>
            <button className="p-1 sm:p-1.5 md:p-2 hover:bg-blue-100 rounded-full transition-colors">
              <svg 
                className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4">
          <div className="border-t border-blue-200 pt-2 sm:pt-3 md:pt-4">
            {conversations.length === 0 ? (
              <div className="text-center py-4 sm:py-6 md:py-8 text-blue-600 px-2">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
                <h4 className="font-medium text-sm sm:text-base md:text-lg mb-1 sm:mb-2">No Conversations Yet</h4>
                <p className="text-xs sm:text-sm">Process some sample payloads first to create test conversations</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {conversations.map((conv) => (
                    <button
                      key={conv.wa_id}
                      onClick={() => simulateCustomerReply(conv.wa_id, conv.contact_name)}
                      className="group bg-white border border-blue-200 rounded-lg p-2 sm:p-3 md:p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left w-full"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                            {(conv.contact_name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h4 className="font-medium text-gray-800 truncate group-hover:text-blue-800 transition-colors text-xs sm:text-sm md:text-base">
                            {conv.contact_name || 'Unknown Contact'}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate font-mono">
                            {conv.wa_id.length > 15 ? `${conv.wa_id.substring(0, 15)}...` : conv.wa_id}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center text-xs sm:text-sm md:text-base">
                    <span className="mr-1 sm:mr-2">⚡</span>
                    <span className="hidden sm:inline">Quick </span>Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button 
                      onClick={() => conversations.forEach(conv => simulateCustomerReply(conv.wa_id, conv.contact_name))}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors truncate"
                    >
                      <span className="hidden sm:inline">Send </span>All
                    </button>
                    <button 
                      onClick={() => {
                        const randomConv = conversations[Math.floor(Math.random() * conversations.length)];
                        if (randomConv) simulateCustomerReply(randomConv.wa_id, randomConv.contact_name);
                      }}
                      className="bg-green-50 hover:bg-green-100 text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors truncate"
                    >
                      Random<span className="hidden sm:inline"> Reply</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerSimulator;
