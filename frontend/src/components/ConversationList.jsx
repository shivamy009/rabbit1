import React from 'react';

// Skeleton component for loading state
const ConversationSkeleton = () => {
  return (
    <div className="space-y-1 p-1 sm:p-2">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-2 sm:p-4 rounded-lg sm:rounded-xl">
          {/* Mobile skeleton */}
          <div className="flex sm:hidden items-center justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Desktop skeleton */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function ConversationList({ conversations, setSelectedWaId, selectedWaId, loading }) {
  return (
    <div className="w-16 sm:w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header - Hidden on mobile */}
      <div className="hidden sm:block p-3 sm:p-4 md:p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Chats</h2>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {loading ? (
                <div className="h-4 w-4 bg-green-200 rounded animate-pulse"></div>
              ) : (
                conversations.length
              )}
            </div>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors" title="New Chat">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <div className="p-4 sm:p-6 md:p-8 text-center hidden sm:block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Start chatting with your customers!</p>
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <p className="text-blue-700 text-xs">💡 Use the Customer Simulator above to test the chat</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-1 sm:p-2">
            {conversations.map((conv, index) => (
              <div
                key={`${conv.wa_id}-${index}`}
                onClick={() => setSelectedWaId(conv.wa_id)}
                className={`cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm ${
                  selectedWaId === conv.wa_id 
                    ? 'bg-green-50 border-l-4 border-green-500 shadow-sm' 
                    : 'bg-transparent hover:bg-gray-50'
                } 
                  sm:p-2 sm:rounded-xl md:p-4
                  p-2 rounded-lg`}
              >
                {/* Mobile: Only Avatar */}
                <div className="flex sm:hidden items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" title={conv.contact_name || 'Unknown Contact'}>
                    <span className="text-white font-semibold text-sm">
                      {(conv.contact_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  {selectedWaId === conv.wa_id && (
                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -ml-2 -mt-2 border-2 border-white"></div>
                  )}
                </div>

                {/* Desktop: Full Content */}
                <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-base md:text-lg">
                      {(conv.contact_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                        {conv.contact_name || 'Unknown Contact'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate font-mono">{conv.wa_id}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        <span className="hidden sm:inline">Click to open chat</span>
                        <span className="sm:hidden">Tap to open</span>
                      </span>
                      {selectedWaId === conv.wa_id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationList;