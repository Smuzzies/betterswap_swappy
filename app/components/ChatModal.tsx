"use client";

import React from 'react';
import Chat from './chat';
import Image from 'next/image';
import { MinusIcon } from '@heroicons/react/24/outline';

const ChatModal = ({ 
  onClose, 
  onMinimize,
  messages,
  setMessages,
  threadId,
  setThreadId,
  isWidget = false
}) => {
  const positionClasses = isWidget 
    ? "w-[450px] h-[600px]" 
    : "fixed top-1/2 right-5 w-[450px] h-[600px] -translate-y-1/2 mt-[30px] shadow-xl";

  return (
    <div className={`bg-[#00093A]/50 text-white rounded-3xl ${positionClasses} flex flex-col
                  overflow-hidden backdrop-blur-sm ${isWidget ? '' : 'z-50'}`}>
      <div className="flex justify-between items-center p-4 bg-[#0A2166]/50 shrink-0 relative z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 relative shrink-0">
            <Image
              src="/swappy.png"
              alt="Swappy AI"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-white tracking-tight">Ask Sw@ppy</h2>
            <p className="text-sm text-gray-300 mt-0.5">
              Responses are meant to guide you through the application. Accuracy may vary.
            </p>
          </div>
        </div>
        <button
          className="text-white hover:text-gray-300 transition p-1"
          onClick={onMinimize}
        >
          <MinusIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <Chat 
          onClose={onClose}
          messages={messages}
          setMessages={setMessages}
          threadId={threadId}
          setThreadId={setThreadId}
        />
      </div>
    </div>
  );
};

export default ChatModal; 