"use client";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { BackgroundLines } from "@/components/ui/background-lines";
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { LoaderFive } from "@/components/ui/loader";

export default function UserPortfolio() {
  const params = useParams();
  const username = params.username as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backgroundType, setBackgroundType] = useState<"ripple" | "beams" | "lines">("ripple");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${username}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setBackgroundType(userData.background_preference);
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
        <LoaderFive text="Loading Portfolio" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
          <p className="text-zinc-400">The username "{username}" doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center font-sans overflow-hidden">
      {backgroundType === "ripple" ? (
        <div className="absolute inset-0 bg-black">
          <BackgroundRippleEffect />
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
        </div>
      ) : backgroundType === "beams" ? (
        <BackgroundBeamsWithCollision className="absolute inset-0 min-h-screen w-full">
          <div />
        </BackgroundBeamsWithCollision>
      ) : (
        <div className="absolute inset-0 bg-black">
          <BackgroundLines className="absolute inset-0">
            <div />
          </BackgroundLines>
        </div>
      )}

      <main className="relative z-10 flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-8 bg-transparent">
        <div className="text-center space-y-6">
          {/* Avatar Section */}
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <Image
                src={user.avatar_url || "/avatar.png"}
                alt={user.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="h-40 flex items-center justify-center">
            <TextHoverEffect text={user.name} />
          </div>
          <p className={`text-xl md:text-2xl ${
            backgroundType === "lines" ? "text-neutral-600 dark:text-neutral-400" : backgroundType === "ripple" ? "text-zinc-400" : "text-neutral-600 dark:text-neutral-400"
          }`}>
            {user.title}
          </p>
          <p className={`text-lg max-w-2xl mx-auto ${
            backgroundType === "lines" ? "text-neutral-500" : backgroundType === "ripple" ? "text-zinc-500" : "text-neutral-500"
          }`}>
            {user.bio}
          </p>
          <Navigation username={username} />
        </div>
      </main>
    </div>
  );
}