"use client";

import { useState } from "react";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  className?: string;
}

export default function BookmarkButton({
  isBookmarked,
  onClick,
  title = "Bookmark",
  className = "",
}: BookmarkButtonProps) {
  const [animate, setAnimate] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 350);
    onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 active:scale-95 shadow-sm flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      title={title}
      aria-label={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 transition-all duration-300 ${
          isBookmarked
            ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
            : "fill-none stroke-slate-400 dark:stroke-slate-500 group-hover:stroke-slate-600 dark:group-hover:stroke-slate-300"
        } ${animate ? "animate-bookmark-pop" : ""}`}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
