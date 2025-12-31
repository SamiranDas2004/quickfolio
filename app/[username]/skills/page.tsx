"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { User } from "@/types/user";
import Navigation from "@/components/Navigation";
import { GridBackground } from "@/components/DynamicBackground";
import { Button } from "@/components/ui/moving-border";

export default function SkillsPage() {
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

  return (
    <div className="relative flex min-h-screen flex-col font-sans overflow-hidden bg-white dark:bg-black">
      <GridBackground />

      <main className="relative z-10 flex flex-col min-h-screen w-full max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8 flex-shrink-0">
          <Navigation username={username} currentPage="/skills" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold text-white mb-12">Skills</h1>
          
          {user?.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-6 justify-center w-full max-w-4xl">
              {user.skills.map((skill, idx) => (
                <Button
                  key={idx}
                  borderRadius="1.75rem"
                  className="bg-black text-white border-slate-800 px-6 py-3"
                  containerClassName="h-14 w-48"
                  duration={3000 + idx * 500}
                >
                  {skill}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-xl">No skills added yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
