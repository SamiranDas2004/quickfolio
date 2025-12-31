"use client";
import { motion, MotionValue } from "framer-motion";
import React from "react";

const transition = {
  duration: 0,
  ease: "linear",
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const GoogleGeminiEffect = ({
  pathLengths,
  title,
  description,
  className,
}: {
  pathLengths: MotionValue[];
  title?: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div className={cn("sticky top-80", className)}>
      <p className="text-lg md:text-7xl font-normal pb-4 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-300">
        {title || `Build with Aceternity UI`}
      </p>
      <p className="text-xs md:text-xl font-normal text-center text-neutral-400 mt-4 max-w-lg mx-auto">
        {description ||
          `Scroll this component and see the bottom SVG come to life wow this works!`}
      </p>
      <svg
        width="1440"
        height="890"
        viewBox="0 0 1440 890"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-60 md:-top-40 w-full"
      >
        {/* Animated paths */}
        <motion.path
          d="M0 600C200 600 300 580 400 550C500 520 600 480 700 460C800 440 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#60A5FA"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          style={{ pathLength: pathLengths[0] }}
          transition={transition}
        />
        <motion.path
          d="M0 500C200 500 300 490 400 485C500 480 600 470 700 460C800 450 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#A78BFA"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          style={{ pathLength: pathLengths[1] }}
          transition={transition}
        />
        <motion.path
          d="M0 400C200 400 300 410 400 420C500 430 600 440 700 445C800 450 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#F472B6"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          style={{ pathLength: pathLengths[2] }}
          transition={transition}
        />

        {/* Blurred background paths */}
        <path
          d="M0 600C200 600 300 580 400 550C500 520 600 480 700 460C800 440 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#60A5FA"
          strokeWidth="3"
          fill="none"
          pathLength={1}
          filter="url(#blurMe)"
        />
        <path
          d="M0 500C200 500 300 490 400 485C500 480 600 470 700 460C800 450 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#A78BFA"
          strokeWidth="3"
          fill="none"
          pathLength={1}
          filter="url(#blurMe)"
        />
        <path
          d="M0 400C200 400 300 410 400 420C500 430 600 440 700 445C800 450 900 445 1000 445C1100 445 1200 445 1300 445C1350 445 1400 445 1440 445"
          stroke="#F472B6"
          strokeWidth="3"
          fill="none"
          pathLength={1}
          filter="url(#blurMe)"
        />

        {/* Resume Icon (Top line - Blue) */}
        <g transform="translate(-15, 575)">
          <rect x="0" y="0" width="50" height="50" rx="6" fill="#000000" />
          <rect x="10" y="10" width="30" height="3" fill="#60A5FA" />
          <rect x="10" y="18" width="30" height="3" fill="#60A5FA" />
          <rect x="10" y="26" width="20" height="3" fill="#60A5FA" />
          <rect x="10" y="34" width="25" height="3" fill="#60A5FA" />
        </g>

        {/* LinkedIn Icon (Middle line - Purple) */}
        <g transform="translate(-15, 475)">
          <rect x="0" y="0" width="50" height="50" rx="6" fill="#000000" />
          <path
            d="M8 11h4v12H8V11zm2-6c1.3 0 2 .8 2 2s-.7 2-2 2-2-.8-2-2 .7-2 2-2zm8 6h3.8v1.7c.5-1 1.8-2 3.7-2 4 0 4.5 2.6 4.5 6V23h-4v-5.5c0-1.5 0-3.4-2-3.4s-2.3 1.6-2.3 3.3V23h-4V11z"
            fill="#A78BFA"
            transform="scale(1) translate(5, 3)"
          />
        </g>

        {/* GitHub Icon (Bottom line - Pink) */}
        <g transform="translate(-15, 375)">
          <rect x="0" y="0" width="50" height="50" rx="6" fill="#000000" />
          <path
            d="M15 3C8.4 3 3 8.4 3 15c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C23.6 24.8 27 20.3 27 15c0-6.6-5.4-12-12-12z"
            fill="#F472B6"
            transform="scale(1) translate(5, 3)"
          />
        </g>

        {/* OpenAI Icon (Middle of paths - White) */}
        <g transform="translate(685, 430)">
          <circle cx="25" cy="25" r="25" fill="#000000" />
          <path
            d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
            fill="#FFFFFF"
            transform="scale(2.1) translate(-3, -3)"
          />
        </g>

        {/* Step 3 Icon (End of paths) */}
        <g transform="translate(1390, 415)">
          <rect x="0" y="0" width="50" height="50" rx="6" fill="#000000" />
          <text x="25" y="32" fontSize="24" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">3</text>
        </g>

        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// Demo component to show usage
export default function Demo() {
  const [pathLengths, setPathLengths] = React.useState([
    { get: () => 0 },
    { get: () => 0 },
    { get: () => 0 }
  ] as any);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 150; // Reduced from 1000 to 400 for faster animation
      const progress = Math.min(scrollY / maxScroll, 1);
      
      setPathLengths([
        { get: () => progress },
        { get: () => Math.max(0, progress - 0.1) },
        { get: () => Math.max(0, progress - 0.2) }
      ]);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[200vh] bg-neutral-950">
      <div className="h-screen" />
      <GoogleGeminiEffect
        pathLengths={pathLengths}
        title="Connect with Me"
        description="Scroll to see the animated paths with social icons come to life"
      />
    </div>
  );
}