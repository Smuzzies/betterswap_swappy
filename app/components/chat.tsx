"use client";

import React, { useState, useEffect, useRef } from "react";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
import Image from "next/image";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { UserIcon } from '@heroicons/react/24/outline';

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center justify-end self-end mb-2">
      <div className="bg-[#27272a] text-white p-3 rounded-lg max-w-[80%] font-['Inter_Tight'] font-normal text-lg">{text}</div>
      <UserIcon className="h-7 w-7 text-white ml-2" />
    </div>
  );
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center self-start mb-2">
      <div className="w-8 h-8 mr-2 relative shrink-0">
        <Image
          src="/swappy.png"
          alt="Swappy AI"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="bg-[#0A2166]/50 text-white p-3 rounded-lg max-w-[80%] font-['Inter_Tight'] font-normal text-lg">
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center self-start mb-2 w-full">
      <div className="w-8 h-8 mr-2 relative shrink-0">
        <Image
          src="/swappy.png"
          alt="Swappy AI"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="bg-[#0A2166]/70 text-[#27272a] p-3 rounded-lg font-mono overflow-x-auto max-w-[80%]">
        {text.split("\n").map((line, index) => (
          <div key={index}>
            <span>{`${index + 1}. `}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start mb-2 ml-12">
      <span className="text-gray-400 font-['Inter_Tight'] font-normal flex items-center text-lg">
        Thinking
        <span className="text-4xl font-bold ml-2">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}>.</span>
        </span>
      </span>
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
  onClose: () => void;
  messages: MessageProps[];
  setMessages: React.Dispatch<React.SetStateAction<MessageProps[]>>;
  threadId: string;
  setThreadId: React.Dispatch<React.SetStateAction<string>>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""),
  onClose,
  messages,
  setMessages,
  threadId,
  setThreadId
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // automatically scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Only create a thread if we don't have one
  useEffect(() => {
    const createThread = async () => {
      if (!threadId) {  // Only create if no threadId exists
        const res = await fetch(`/api/assistants/threads`, {
          method: "POST",
        });
        const data = await res.json();
        setThreadId(data.threadId);
      }
    };
    createThread();
  }, [threadId]); // Add threadId to dependencies

  const sendMessage = async (text) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    };
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  }

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
    
  }

  return (
    <div className="flex flex-col h-full bg-[#00093A] font-['Inter_Tight'] font-normal">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#27272a] scrollbar-track-[#0A2166]/30 
                    scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        {inputDisabled && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Code message scrollbar styling */}
      <style jsx global>{`
        /* Custom scrollbar for webkit browsers */
        .overflow-x-auto::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track,
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(10, 33, 102, 0.3);
          border-radius: 10px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb,
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover,
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #323235;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #27272a rgba(10, 33, 102, 0.3);
        }
      `}</style>

      {/* Input Form */}
      <div className="border-t border-[#081C59] p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-3 rounded-lg bg-[#0A2166] text-white border border-[#081C59] 
                     focus:outline-none focus:border-[#27272a] placeholder-gray-400
                     font-['Inter_Tight'] font-normal text-lg"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your question here..."
            disabled={inputDisabled}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#27272a] text-white rounded-lg hover:bg-[#27272a]/80 
                     transition disabled:bg-gray-600 disabled:cursor-not-allowed
                     font-['Inter_Tight'] font-normal text-lg"
            disabled={inputDisabled}
          >
            Send
          </button>
        </form>
        <p className="text-gray-400 text-sm mt-2 px-1 font-['Inter_Tight'] font-normal text-center">
          AI responses are for informational purposes only and should not be considered as financial, legal, or professional advice. Please consult with qualified professionals for specific advice.
        </p>
      </div>
    </div>
  );
};

export default Chat;
