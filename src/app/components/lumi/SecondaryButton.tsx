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
        bg-white
        text-[var(--lumi-text-primary)]
        border-2 
        border-[var(--lumi-border)]
        rounded-[1.5rem]
        hover:border-[var(--lumi-sky-blue)]
        hover:bg-[var(--lumi-neutral-bg)]
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
