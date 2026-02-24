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
        h-14 px-6
        bg-[var(--lumi-calm-orange)]
        text-white
        rounded-[1.5rem]
        hover:bg-[#FF9E4D]
        active:scale-[0.98]
        transition-all
        disabled:opacity-50 
        disabled:cursor-not-allowed
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
