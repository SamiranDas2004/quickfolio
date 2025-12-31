"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { User } from "@/types/user";
import Navigation from "@/components/Navigation";
import { GridBackground } from "@/components/DynamicBackground";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import toast from "react-hot-toast";

export default function ContactPage() {
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
          <Navigation username={username} currentPage="/contact" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {user?.contact?.email || user?.contact?.phone || user?.contact?.location || (user?.social_links && Object.keys(user.social_links).some(key => user.social_links[key])) ? (
            <CardContainer className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[35rem] h-auto rounded-xl p-8 border">
                <CardItem translateZ="50" className="text-3xl font-bold text-neutral-600 dark:text-white mb-2">
                  Get In Touch
                </CardItem>
                <CardItem translateZ="60" as="p" className="text-neutral-500 text-sm max-w-sm mb-6 dark:text-neutral-300">
                  Feel free to reach out through any of these channels
                </CardItem>
                
                <div className="space-y-4">
                  {/* Email */}
                  {user?.contact?.email && (
                    <CardItem translateZ="80" className="w-full">
                      <div 
                        className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-all cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(user.contact.email);
                          toast.success("Email copied to clipboard!");
                        }}
                      >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-neutral-400 text-xs">Email</p>
                          <a href={`mailto:${user.contact.email}`} className="text-white hover:text-blue-400 transition-colors">
                            {user.contact.email}
                          </a>
                        </div>
                      </div>
                    </CardItem>
                  )}

                  {/* Phone */}
                  {user?.contact?.phone && (
                    <CardItem translateZ="80" className="w-full">
                      <div 
                        className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-all cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(user.contact.phone);
                          toast.success("Phone number copied to clipboard!");
                        }}
                      >
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-neutral-400 text-xs">Phone</p>
                          <a href={`tel:${user.contact.phone}`} className="text-white hover:text-green-400 transition-colors">
                            {user.contact.phone}
                          </a>
                        </div>
                      </div>
                    </CardItem>
                  )}

                  {/* Location */}
                  {user?.contact?.location && (
                    <CardItem translateZ="80" className="w-full">
                      <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-neutral-400 text-xs">Location</p>
                          <p className="text-white">{user.contact.location}</p>
                        </div>
                      </div>
                    </CardItem>
                  )}
                </div>

                {/* Social Links */}
                {user?.social_links && Object.keys(user.social_links).some(key => user.social_links[key]) && (
                  <CardItem translateZ="100" className="w-full mt-6">
                    <div className="border-t border-white/10 pt-6">
                      <p className="text-neutral-400 text-sm mb-4">Connect on Social Media</p>
                      <div className="flex flex-wrap gap-3">
                        {user.social_links.linkedin && (
                          <a 
                            href={user.social_links.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            onClick={() => toast("Opening LinkedIn profile", { icon: "🔗" })}
                          >
                            LinkedIn
                          </a>
                        )}
                        {user.social_links.github && (
                          <a 
                            href={user.social_links.github} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
                            onClick={() => toast("Opening GitHub profile", { icon: "🔗" })}
                          >
                            GitHub
                          </a>
                        )}
                        {user.social_links.twitter && (
                          <a 
                            href={user.social_links.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
                            onClick={() => toast("Opening Twitter profile", { icon: "🔗" })}
                          >
                            Twitter
                          </a>
                        )}
                        {user.social_links.website && (
                          <a 
                            href={user.social_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                            onClick={() => toast("Opening website", { icon: "🔗" })}
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </CardItem>
                )}
              </CardBody>
            </CardContainer>
          ) : (
            <p className="text-zinc-400 text-xl">No contact information available</p>
          )}
        </div>
      </main>
    </div>
  );
}
