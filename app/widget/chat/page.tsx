"use client";

import React, { useState } from 'react';
import ChatModal from '@/app/components/ChatModal';

export default function WidgetChatPage() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState("");

  return (
    <div className="w-[450px] h-[600px] flex items-center justify-center">
      <ChatModal 
        messages={messages}
        setMessages={setMessages}
        threadId={threadId}
        setThreadId={setThreadId}
        onClose={() => {}}
        onMinimize={() => {}}
        isWidget={true}
      />
    </div>
  );
} 