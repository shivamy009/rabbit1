import React from 'react';

function MessageBubble({ message, isSent }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-gray-400">✓✓</span>;
      case 'read':
        return <span className="text-blue-500">✓✓</span>;
      default:
        return <span className="text-gray-400">⏳</span>;
    }
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isSent ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isSent
              ? 'bg-green-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
          }`}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed break-words">
            {message.text}
          </p>
          
          {/* Time and Status */}
          <div className={`flex items-center justify-end mt-2 space-x-1 ${
            isSent ? 'text-green-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {formatTime(message.timestamp)}
            </span>
            {isSent && (
              <span className="text-xs">
                {getStatusIcon(message.status)}
              </span>
            )}
          </div>
          
          {/* Message Tail */}
          <div
            className={`absolute top-0 w-0 h-0 ${
              isSent
                ? 'right-0 translate-x-0 border-l-8 border-l-green-500 border-t-8 border-t-transparent'
                : 'left-0 -translate-x-0 border-r-8 border-r-white border-t-8 border-t-transparent'
            }`}
            style={{
              top: '0px',
              ...(isSent ? { right: '-8px' } : { left: '-8px' })
            }}
          />
        </div>
        
        {/* Sender Name (for received messages) */}
        {!isSent && (
          <div className="mt-1 px-2">
            <span className="text-xs text-gray-500 font-medium">
              {message.contact_name || 'Unknown'}
            </span>
          </div>
        )}
      </div>
      
      {/* Avatar for received messages */}
      {!isSent && (
        <div className="order-0 mr-3 mt-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {(message.contact_name || 'U')[0].toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;