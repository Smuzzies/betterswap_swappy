"use client";

import React, { useState } from 'react';
import ChatModal from '@/app/components/ChatModal';

export default function WidgetChatPage() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState("");

  return (
    <div className="h-screen w-full bg-transparent">
      <ChatModal 
        messages={messages}
        setMessages={setMessages}
        threadId={threadId}
        setThreadId={setThreadId}
        onClose={() => {}}
        onMinimize={() => {}}
      />
    </div>
  );
} 