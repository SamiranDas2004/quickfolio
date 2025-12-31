"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { GridBackground } from "@/components/DynamicBackground";
import Carousel from "@/components/ui/carousel";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  image_url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ProjectsPage() {
  const params = useParams();
  const username = params.username as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bgType, setBgType] = useState<"ripple" | "beams" | "lines">("ripple");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, projectsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/users/${username}`),
          fetch(`http://localhost:8000/api/projects/${username}`)
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setBgType(userData.background_preference);
        }
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
          
          if (projectsData.length > 0) {
            setMessages([{
              role: "assistant",
              content: `I have ${projectsData.length} project${projectsData.length > 1 ? 's' : ''} to show you. Feel free to ask me anything about them!`
            }]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const response = await fetch(`http://localhost:8000/api/chat/projects/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that question." },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const slides = projects.map(project => ({
    title: project.title,
    button: project.live_url ? "View Live" : "View on GitHub",
    src: project.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    description: project.description,
    tech_stack: project.tech_stack,
    github_url: project.github_url,
    live_url: project.live_url
  }));

  return (
    <div className="relative flex min-h-screen flex-col font-sans overflow-hidden bg-white dark:bg-black">
      <GridBackground />

      <main className="relative z-10 flex flex-col h-screen w-full px-8 py-8">
        <div className="mb-8 flex-shrink-0 max-w-7xl mx-auto w-full">
          <Navigation username={username} currentPage="/projects" />
        </div>

        {projects.length > 0 ? (
          <div className="flex-1 flex gap-6 min-h-0 max-w-7xl mx-auto w-full">
            {/* Carousel Section */}
            <div className="flex-1 flex items-center justify-center">
              <Carousel slides={slides} />
            </div>

            {/* Chat Section - Full Height Right Side */}
            <div className="flex-1 flex flex-col bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden h-full">
              <div className="p-5 border-b border-white/20 flex-shrink-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <h3 className="text-white font-semibold text-lg">Ask about projects</h3>
                <p className="text-zinc-400 text-xs mt-1">Chat with AI about my work</p>
              </div>
              
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3"
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
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
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
                    <div className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm">
                      <p>Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about projects..."
                    disabled={sending}
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-400 text-xl">No projects available</p>
          </div>
        )}
      </main>
    </div>
  );
}