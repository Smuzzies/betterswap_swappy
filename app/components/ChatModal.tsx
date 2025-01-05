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
  setThreadId
}) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onMinimize();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex md:items-end md:justify-end items-center justify-center z-50 font-['Inter_Tight'] font-normal md:p-5"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#00093A]/50 text-white rounded-3xl shadow-xl relative w-full max-w-3xl md:h-[85vh] h-[80vh] flex flex-col
                    overflow-hidden backdrop-blur-sm">
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
    </div>
  );
};

export default ChatModal; 