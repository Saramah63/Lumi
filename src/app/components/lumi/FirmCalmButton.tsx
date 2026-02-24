import { ButtonHTMLAttributes, ReactNode } from "react";

interface FirmCalmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function FirmCalmButton({ 
  children, 
  className = "", 
  ...props 
}: FirmCalmButtonProps) {
  return (
    <button
      className={`
        w-full h-14 px-6
        bg-[var(--lumi-calm-orange)]
        text-[#1f2937]
        rounded-[1.5rem]
        border-2 border-[#d97706]
        hover:bg-[#ffc07a]
        active:scale-[0.98]
        transition-all
        focus-visible:ring-4 focus-visible:ring-[#d97706]/30
        disabled:opacity-50 
        disabled:cursor-not-allowed
        shadow-md
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
