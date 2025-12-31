"use client";
import { cn } from "@/lib/utils";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Compare } from "@/components/ui/compare";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { MouseScroll } from "@/components/ui/mouse-scroll";
import { useScroll, useTransform } from "motion/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);

  const handleGetStarted = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setChecking(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/check-username/${username}`);
      const data = await response.json();

      if (data.available) {
        toast.success("Username available! Redirecting...");
        router.push(`/signup?username=${username}`);
      } else {
        toast.error("Username already taken");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const words = [
    { text: "Build" },
    { text: "Your" },
    { text: "AI" },
    { text: "Powered" },
    { text: "Portfolio" },
    { text: "Now", className: "text-blue-500 dark:text-blue-500" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-zinc-900 dark:text-white">quickfolio</div>
          
          <nav className="flex gap-8">
            <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Home</a>
            <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Examples</a>
            <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Dashboard</a>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_2px,transparent_2px),linear-gradient(to_bottom,#e4e4e7_2px,transparent_2px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_2px,transparent_2px),linear-gradient(to_bottom,#262626_2px,transparent_2px)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
        
        <div className="relative z-20 w-full space-y-8 -mt-20">
          <div className="h-40 flex items-center justify-center overflow-visible px-4">
            <TextHoverEffect text="Welcome to quickfolio" />
          </div>
          
          <div className="text-center max-w-4xl mx-auto px-6">
            <TypewriterEffectSmooth words={words} className="text-5xl md:text-7xl" />

            <div className="flex justify-center mt-8">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="div"
                className="bg-white dark:bg-black"
              >
                <div className="flex items-center rounded-full px-6 py-3 gap-4 max-w-md w-full">
                  <span className="text-base text-zinc-500 dark:text-zinc-400">quickfolio.dev/</span>
                  <input
                    placeholder="your-name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
                    className="bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 flex-1"
                  />
                  <button
                    onClick={handleGetStarted}
                    disabled={checking}
                    className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    {checking ? "..." : "→"}
                  </button>
                </div>
              </HoverBorderGradient>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
            
            <div className="mt-26">
              <MouseScroll />
            </div>
          </div>
        </div>
      </div>

      <section className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black py-20">
        <div className="text-center mb-12 px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-4">Be outstanding</h2>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-2">Let's be honest, nobody reads resumes anymore.</p>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400">This is the best way to sell yourself.</p>
        </div>
        
        <div className="w-3/4 h-[60vh] px-1 md:px-8 flex items-center justify-center [perspective:800px] [transform-style:preserve-3d]">
          <div
            style={{
              transform: "rotateX(15deg) translateZ(80px)",
            }}
            className="p-1 md:p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800 mx-auto w-3/4 h-1/2 md:h-3/4"
          >
            <Compare
              firstImage="/assests/banner.png"
              secondImage="/assests/c1.png"
              firstImageClassName="object-cover object-left-top w-full"
              secondImageClassname="object-cover object-left-top w-full"
              className="w-full h-full rounded-[22px] md:rounded-lg"
              slideMode="hover"
              autoplay={true}
            />
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-6 py-3"
          >
            <span className="text-lg font-semibold">Create Your AI Portfolio</span>
          </HoverBorderGradient>
        </div>
      </section>

    {/*
<section className="w-full flex flex-col items-center justify-center bg-white dark:bg-black py-28">
  <div className="text-center mb-16 px-6">
    <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-4">
      How it works
    </h2>
    <p className="text-xl text-zinc-600 dark:text-zinc-400">
      Three simple steps to create your AI-powered portfolio
    </p>
  </div>

  <div className="max-w-6xl mx-auto px-6 w-full relative">
    <div className="hidden md:block absolute top-8 left-[16.66%] w-[33.33%] h-1 overflow-hidden">
      <div className="h-full w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
    </div>

    <div className="hidden md:block absolute top-16 left-[16.66%] w-[33.33%] h-1 overflow-hidden">
      <div className="h-full w-32 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
    </div>

    <div className="hidden md:block absolute top-12 left-[50%] w-[33.33%] h-1 overflow-hidden">
      <div className="h-full w-32 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
      <div className="flex flex-col items-center text-center relative">
        <h3 className="text-2xl font-bold">Upload Data</h3>
      </div>

      <div className="flex flex-col items-center text-center relative">
        <h3 className="text-2xl font-bold">AI Processing</h3>
      </div>

      <div className="flex flex-col items-center text-center relative">
        <h3 className="text-2xl font-bold">Go Live</h3>
      </div>
    </div>
  </div>
</section>
*/}


      <section className="w-full bg-white dark:bg-black py-28">
        <div className="text-center mb-12 px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-4">Portfolio Examples</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">See what others have created</p>
        </div>
        <div className="mx-auto max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
          <ThreeDMarquee images={[
            "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
            "https://assets.aceternity.com/animated-modal.png",
            "https://assets.aceternity.com/animated-testimonials.webp",
            "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
            "https://assets.aceternity.com/github-globe.png",
            "https://assets.aceternity.com/glare-card.png",
            "https://assets.aceternity.com/layout-grid.png",
            "https://assets.aceternity.com/flip-text.png",
            "https://assets.aceternity.com/hero-highlight.png",
            "https://assets.aceternity.com/carousel.webp",
            "https://assets.aceternity.com/placeholders-and-vanish-input.png",
            "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
            "https://assets.aceternity.com/signup-form.png",
            "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
            "https://assets.aceternity.com/spotlight-new.webp",
            "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
            "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
            "https://assets.aceternity.com/tabs.png",
            "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
            "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
            "https://assets.aceternity.com/glowing-effect.webp",
            "https://assets.aceternity.com/hover-border-gradient.png",
            "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
            "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
            "https://assets.aceternity.com/macbook-scroll.png",
            "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
            "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
            "https://assets.aceternity.com/multi-step-loader.png",
            "https://assets.aceternity.com/vortex.png",
            "https://assets.aceternity.com/wobble-card.png",
            "https://assets.aceternity.com/world-map.webp",
          ]} />
        </div>
      </section>

      <div
        className="h-[400vh] bg-black w-full dark:border dark:border-white/[0.1] rounded-md relative pt-40 overflow-clip"
        ref={ref}
      >
        <GoogleGeminiEffect
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
          ]}
          title="How it works"
          description="Scroll to see the magic happen as your portfolio comes to life"
        />
      </div>

      <div className="w-full overflow-hidden bg-black dark:bg-black">
        <MacbookScroll
          title={
            <span>
              See Your Portfolio <br /> Come to Life
            </span>
          }
          src="/assests/banner.png"
          showGradient={false}
        />
      </div>

      <section className="w-full bg-white dark:bg-black py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <details className="group border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-zinc-900 dark:text-white">
                How does quickfolio work?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Simply upload your resume or LinkedIn profile, and our AI will analyze your information to create a stunning, interactive portfolio website. The entire process takes just a few minutes.</p>
            </details>

            <details className="group border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-zinc-900 dark:text-white">
                Can I customize my portfolio?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Yes! While our AI creates the initial design, you can customize colors, layouts, and content to match your personal brand and style.</p>
            </details>

            <details className="group border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-zinc-900 dark:text-white">
                Do I get a custom domain?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Absolutely! Every portfolio comes with a custom quickfolio.dev subdomain, and you can also connect your own custom domain if you prefer.</p>
            </details>

            <details className="group border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-zinc-900 dark:text-white">
                What makes quickfolio different from other portfolio builders?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">quickfolio uses AI to create interactive portfolios where visitors can chat with an AI version of you. It's not just a static website—it's an engaging experience that showcases your personality and expertise.</p>
            </details>

            <details className="group border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-zinc-900 dark:text-white">
                How much does it cost?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">We offer flexible pricing plans starting from free for basic portfolios. Premium plans include advanced AI features, custom domains, and analytics. Check our pricing page for detailed information.</p>
            </details>
          </div>
        </div>
      </section>

      <footer className="w-full bg-zinc-900 dark:bg-black border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">quickfolio</h3>
              <p className="text-zinc-400 text-sm">Build your AI-powered portfolio in minutes</p>
            </div>
            <p className="text-zinc-400 text-sm">&copy; 2024 quickfolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
