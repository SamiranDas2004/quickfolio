"use client";
import { motion } from "motion/react";

export const MouseScroll = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-6 h-10 border-2 border-zinc-400 dark:border-zinc-600 rounded-full flex justify-center p-2">
        <motion.div
          className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        className="text-xs text-zinc-400 dark:text-zinc-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Scroll
      </motion.div>
    </div>
  );
};
