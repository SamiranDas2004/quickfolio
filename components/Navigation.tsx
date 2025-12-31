"use client";
import { NoiseBackground } from "@/components/ui/noise-background";
import { useRouter } from "next/navigation";

interface NavigationProps {
  username: string;
  currentPage?: string;
}

export default function Navigation({ username, currentPage }: NavigationProps) {
  const router = useRouter();

  const navItems = [
    { label: "Me", path: `/me` },
    { label: "Skills", path: `/skills` },
    { label: "Contact", path: `/contact` },
    { label: "Resume", path: `/resume` },
    { label: "Projects", path: `/projects` },
  ];

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {navItems.map((item) => (
        <NoiseBackground
          key={item.label}
          containerClassName="w-30 p-2 rounded-full"
          gradientColors={[
            "rgb(255, 100, 150)",
            "rgb(100, 150, 255)",
            "rgb(255, 200, 100)",
          ]}
        >
          <button
            onClick={() => router.push(`/${username}${item.path}`)}
            className={`h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)] ${
              currentPage === item.path ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {item.label}
          </button>
        </NoiseBackground>
      ))}
    </div>
  );
}
