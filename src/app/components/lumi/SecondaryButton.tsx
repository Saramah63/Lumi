import { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "md" | "lg";
}

export function SecondaryButton({ 
  children, 
  size = "lg", 
  className = "", 
  ...props 
}: SecondaryButtonProps) {
  const sizeClasses = {
    md: "h-14 px-6",
    lg: "h-16 px-8"
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        w-full
        bg-white
        text-[var(--lumi-text-primary)]
        border-2 
        border-[var(--lumi-border)]
        rounded-[1.5rem]
        hover:border-[var(--lumi-sky-blue)]
        hover:bg-[#f2faff]
        active:scale-[0.98]
        transition-all
        focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/25
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
