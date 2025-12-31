"use client";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Spotlight } from "@/components/ui/spotlight";

export function DynamicBackground({ type }: { type: "ripple" | "beams" | "lines" }) {
  if (type === "beams") {
    return (
      <BackgroundBeamsWithCollision className="absolute inset-0 min-h-screen w-full">
        <div />
      </BackgroundBeamsWithCollision>
    );
  }
  
  if (type === "lines") {
    return (
      <div className="absolute inset-0 bg-black">
        <BackgroundLines className="absolute inset-0">
          <div />
        </BackgroundLines>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 bg-black">
      <BackgroundRippleEffect />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
    </div>
  );
}

export function GridBackground() {
  return (
    <>
      <div className="absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
    </>
  );
}
