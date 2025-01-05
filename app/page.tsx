"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import ChatModal from '@/app/components/ChatModal';

export default function MainPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState("");

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsModalOpen(false);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setIsModalOpen(true);
  };

  return (
    <div className="relative h-screen w-screen">
      <iframe 
        src="https://swap.tbc.vet" 
        className="w-full h-full border-none"
        title="Swap Interface"
      />
      
      <button 
        className="fixed bottom-5 right-5 p-5 bg-[#27272a]/75 text-white rounded-full shadow-lg hover:bg-[#27272a]/90 transition focus:outline-none z-50 w-28 h-28"
        onClick={handleMaximize}
      >
        <div className="relative w-full h-full">
          <Image
            src="/swappy.png"
            alt="Open Chat"
            fill
            className="object-contain"
            priority
          />
        </div>
      </button>

      {isModalOpen && (
        <ChatModal 
          onClose={() => setIsModalOpen(false)} 
          onMinimize={handleMinimize}
          messages={messages}
          setMessages={setMessages}
          threadId={threadId}
          setThreadId={setThreadId}
        />
      )}
    </div>
  );
}
