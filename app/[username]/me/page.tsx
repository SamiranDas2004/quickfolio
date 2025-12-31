"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/types/user";
import Navigation from "@/components/Navigation";
import { GridBackground } from "@/components/DynamicBackground";
import { Mic, MicOff } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${username}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Load chat history from localStorage
          const saved = localStorage.getItem(`chat_${username}`);
          if (saved) {
            setMessages(JSON.parse(saved));
          } else {
            // Show initial user info
            const initialMessage = `Hi! I'm ${userData.name}${userData.title ? `, ${userData.title}` : ''}.\n\n${userData.bio || ''}\n\n${userData.skills?.length ? `Skills: ${userData.skills.join(', ')}` : ''}\n\nFeel free to ask me anything!`;
            setMessages([{ role: "assistant", content: initialMessage }]);
          }
        } else {
          router.push(`/${username}`);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push(`/${username}`);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Save chat history to localStorage
    if (messages.length > 0) {
      localStorage.setItem(`chat_${username}`, JSON.stringify(messages));
    }
  }, [messages, username]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    // Add empty assistant message for streaming
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`http://localhost:8000/api/chat/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantIndex] = {
            role: "assistant",
            content: "Sorry, I couldn't process that question."
          };
          return newMessages;
        });
        setSending(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setSending(false);
        return;
      }

      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullResponse += data.chunk;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[assistantIndex] = {
                    role: "assistant",
                    content: fullResponse
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantIndex] = {
          role: "assistant",
          content: "Sorry, something went wrong."
        };
        return newMessages;
      });
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch("http://localhost:8000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setInput(data.text);
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col font-sans overflow-hidden bg-white dark:bg-black">
      <GridBackground />

      <main className="relative z-10 flex flex-col h-screen w-full max-w-4xl mx-auto px-8 py-8">
        {/* Navigation */}
        <div className="mb-8 flex-shrink-0">
          <Navigation username={username} currentPage="/me" />
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden min-h-0">
          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white border border-white/20"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                disabled={sending || isRecording}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={sending}
                className={`p-3 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-white/5 hover:bg-white/10 border border-white/20"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
