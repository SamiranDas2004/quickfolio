"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { User } from "@/types/user";
import Navigation from "@/components/Navigation";
import { GridBackground } from "@/components/DynamicBackground";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { FileText } from "lucide-react";

export default function ResumePage() {
  const params = useParams();
  const username = params.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${username}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const resumeUrl = user?.contact?.resume_url;

  return (
    <div className="relative flex min-h-screen flex-col font-sans overflow-hidden bg-white dark:bg-black">
      <GridBackground />

      <main className="relative z-10 flex flex-col min-h-screen w-full max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8 flex-shrink-0">
          <Navigation username={username} currentPage="/resume" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {resumeUrl ? (
            <div className="min-h-[20rem] w-full max-w-2xl">
              <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-8 md:p-10 dark:shadow-[0px_0px_27px_0px_#2D2D2D] bg-black/80 backdrop-blur-sm">
                  <div className="relative flex flex-1 flex-col justify-between gap-6">
                    <div className="w-fit rounded-lg border border-gray-600 p-3">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-sans text-3xl font-semibold text-white">
                        View My Resume
                      </h3>
                      <p className="font-sans text-base text-neutral-400">
                        Click below to open and view my complete resume in a new tab
                      </p>
                    </div>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-semibold text-center"
                    >
                      Open Resume →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400 text-xl">No resume available</p>
          )}
        </div>
      </main>
    </div>
  );
}
