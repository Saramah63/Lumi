import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "md" | "lg";
}

export function PrimaryButton({ 
  children, 
  size = "lg", 
  className = "", 
  ...props 
}: PrimaryButtonProps) {
  const sizeClasses = {
    md: "h-14 px-6",
    lg: "h-16 px-8"
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        w-full
        bg-[var(--lumi-sky-blue)]
        text-white
        rounded-[1.5rem]
        border-2 border-[var(--lumi-sky-blue-dark)]
        hover:bg-[var(--lumi-sky-blue-dark)]
        hover:shadow-[0_10px_28px_rgba(58,124,168,0.28)]
        active:scale-[0.98]
        transition-all
        focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/30
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
